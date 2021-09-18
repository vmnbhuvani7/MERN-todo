import gql from "graphql-tag";

export const SIGNIN = gql`
mutation signIn($input:signInInput!) {
    signIn(input: $input) {
      token
      user{
        id
        userName
        image
        address
        email
        phoneNumber
        isDeleted
        roles
      }
    }
  }
`