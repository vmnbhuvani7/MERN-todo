
import fs from "fs"
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer"
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { isAuthenticated } from './authorization';

const createToken = async (user, secret) => {
    const { id, email, username, role } = user;
    return await jwt.sign({ id, email, username, role }, secret);
};

module.exports = {
    Query: {

        getAdminUsers: combineResolvers(
            isAuthenticated, (parent, args, { models, me }) => {
                return new Promise(async (resolve, reject) => {
                    const filter = {
                        '$and': [
                            {
                                "$or": [
                                    {
                                        email: new RegExp(args.search, "i")
                                    },
                                    {
                                        userName: new RegExp(args.search, "i")
                                    }
                                ]
                            },
                            { "_id": { $nin: [me._id] } }
                        ],
                    };
                    const sort = { "createdAt": -1 }
                    await models.User.paginate(
                        filter,
                        { page: args.page, limit: args.limit, sort: sort }
                    ).then(res => {
                        resolve({ count: res.total, data: res.docs })
                    }).catch(err => {
                        reject(err)
                    })
                });
            }),

    },
    Mutation: {
        /*
            signIn:
        */
        signIn: async (parent, { input }, { models, secret }) => {
            const email = input.email
            const password = input?.password
            const user = await models.User.findByLogin(email);
            if (!user) {
                throw new UserInputError(
                    'No user found with this login credentials.',
                );
            }
            const isValid = await user.validatePassword(password, input?.type);
            if (isValid === 1) {
                throw new AuthenticationError('Invalid password.');
            } else if (user.isDeleted) {
                throw new UserInputError(
                    'No user found with this login credentials.',
                );
            } else {
                return { token: createToken(user, secret), user: user }
            }
        },
        /*
            createUser:
        */
        createUser: combineResolvers(
            isAuthenticated,
            (parent, { input }, { models, me }) => {
                return new Promise(async (resolve, reject) => {
                    if (!input.userName) {
                        reject("Please enter User Name!.")
                    } else if (!input.email) {
                        reject("Please enter Email!.")
                    } else if (!input.password) {
                        reject("Please enter password!.")
                    } else {
                        await models.User.find({ $or: [{ email: { $regex: input.email, $options: "i" } }, { userName: { $regex: input.userName, $options: "i" } }] }).exec((err, res) => {
                            if (err) {
                                reject(err)
                            } else if (res?.length == 0) {
                                if (input?.image) {
                                    let base64String = input.image;
                                    let base64Image = base64String.split(';base64,').pop();
                                    const imgName = `${+new Date}.png`;
                                    input["image"] = imgName;
                                    fs.writeFileSync(`${process.env.ASSETS_STORAGE}/${imgName}`, base64Image, { encoding: 'base64' });
                                }

                                models.User.create(input, async (err, res) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        models.User.findOne({ "_id": res._id }).exec((err, getUser) => {
                                            if (err)
                                                reject('Failed to update password,please try again')
                                            else {
                                                getUser.password = input.password;
                                                getUser.save((err, user) => {
                                                    if (err) reject('Failed to update password,please try again')
                                                    else
                                                        resolve(res);
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                reject('Email or Username already exists.')
                            }
                        })
                    }
                });
            },
        ),
        /*
            updateUser:
        */
        updateUser: combineResolvers(
            isAuthenticated, (parent, { input }, { models, me }) => {
                return new Promise(async (resolve, reject) => {
                    const userId = input.id
                    delete input.id
                    models.User.findById(userId).exec((err, res) => {
                        if (err)
                            reject(err);
                        if (res !== null) {
                            if (input?.image?.search(";base64,") !== -1) {
                                let base64String = input.image;
                                let base64Image = base64String.split(';base64,').pop();
                                const imgName = `${+new Date}.png`;
                                input['image'] = imgName;
                                fs.writeFileSync(`${process.env.ASSETS_STORAGE}/${imgName}`, base64Image, { encoding: 'base64' });
                            }
                            models.User.findByIdAndUpdate(userId, input, { new: true }, (err, res) => {
                                if (err)
                                    reject(err)
                                else {
                                    resolve(res)
                                }
                            });
                        } else
                            reject({ message: "No User Found!" })
                    });

                })
            }),
        /*
            deleteUser:
        */
        deleteUser: combineResolvers(
            isAuthenticated, (_, { id, isDeleted }, { models }) => {
                return new Promise((resolve, reject) => {
                    models.User.findByIdAndUpdate(id, { isDeleted }, { new: true }, (err, docs) => {
                        if (err)
                            reject(err)
                        else {
                            resolve(docs)
                        }
                    });
                });
            }),
        /*
            forgotPassword:
        */
        forgotPassword: async (_, { email }, { models }) => {
            return new Promise((resolve, reject) => {
                const code = Math.random().toString(36).substr(2, 4)
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD
                    }
                })
                const mailOption = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Forgot Password OTP',
                    text: `OTP: ${code}`
                }

                transporter.sendMail(mailOption, async (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        const existing = await models.User.findOne({ email })
                        if (existing) {
                            await models.User.findByIdAndUpdate(existing._id, { code }, { new: true }, (err) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve("Mail Send Successfully!.")
                                }
                            })
                        } else {
                            reject("You have not user")
                        }
                    }
                })
            });
        },

        /*
            resetPassword:
        */
        resetPassword: (parent, { input }, { models }) => {
            return new Promise((resolve, reject) => {
                models.User.findOne({ "code": input.code, email: input.email }).exec((err, getUser) => {
                    if (err)
                        reject('Failed to update password,please try again')
                    else if (getUser === null)
                        reject('Failed to reset Password')
                    else {
                        getUser.password = input.password;
                        getUser.save(err => {
                            if (err) reject('Failed to update password,please try again')
                            else
                                resolve("Password successfully updated")
                        });
                    }
                })
            })
        },
    }
}