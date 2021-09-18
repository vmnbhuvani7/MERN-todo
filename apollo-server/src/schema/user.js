const { gql } = require('apollo-server-express');

module.exports = gql`
    extend type Query {
       getAdminUsers(page: Int, limit: Int, search: String, filter: String): userPaginatedData
    }
    
    extend type Mutation {
        signIn(input:signInInput!): Token!
        createUser(input: systemUserInput!): User
        updateUser(input: userInput!): User
        deleteUser(id: ID!, isDeleted: Boolean): User
        forgotPassword(email: String): String
        resetPassword(input: resetPasswordInput!): String
    }

    input resetPasswordInput {
        code: String!
        password:String!
        email:String!
    }


    type userPaginatedData {
        count: Int
        data: [User]
    }

    input signInInput {
        password: String!
        email: String!
    }

    type Token {
        token: String!
        user: User
      }

    input userInput {
        id: ID!
        userName: String
        image: String
        address: String
        email: String
        password: String
        phoneNumber: Int
        isDeleted: Boolean
        roles: String
    }

    input systemUserInput {
        userName: String
        image: String
        address: String
        email: String
        password: String
        phoneNumber: Int
        isDeleted: Boolean
        roles: String
    }

   
    type User {
        id:ID
        userName: String
        image: String
        address: String
        email: String
        phoneNumber: Int
        isDeleted: Boolean
        roles: String
    }
`;