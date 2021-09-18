const { gql } = require('apollo-server-express');

module.exports = gql`

    scalar Date
    scalar JSON

    directive @isAuth on FIELD_DEFINITION

    type Query {
        _: Boolean!
    }
    type Mutation {
        _: Boolean!
    }
    type Subscription {
        _: Boolean!
    }
    
`;