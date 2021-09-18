import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail';

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    // required: true
  },
  roles: {
    type: String,
    default: "GroupAdmin"
  },
  image: {
    type: String
  },
  address: {
    type: String
  },
  phoneNumber: {
    type: Number
  },
  email: {
    type: String,
    unique: true,
    validate: [isEmail, 'No valid email address provided.'],
  },
  password: {
    type: String,
  },
  otp: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
}, { strict: false, timestamps: true });

userSchema.statics.findByLogin = async function (login) {
  let user = await this.findOne({
    username: login,
  });
  if (!user) {
    user = await this.findOne({ email: login });
  }
  return user;
};

userSchema.pre('save', async function () {
  if (this.password) {
    this.password = await this.generatePasswordHash();
  }
});

userSchema.methods.generatePasswordHash = async function () {
  const saltRounds = 10;
  return await bcrypt.hash(this.password, saltRounds);
};

userSchema.methods.validatePassword = async function (password, type) {
  if (this.password) {
    const validate = await bcrypt.compare(password, this.password);
    if (validate) {
      return 0 // valid password
    }
    return 1 // invalid password
  }
};

userSchema.plugin(mongoosePaginate);

const User = mongoose.model('user', userSchema);

export default User;
