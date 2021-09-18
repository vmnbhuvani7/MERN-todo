import gql from "graphql-tag";

export const DELETE_USER = gql`
mutation deleteUser($id: ID!, $isDeleted: Boolean) {
    deleteUser(id: $id, isDeleted: $isDeleted) {
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
`

export const CREATE_USER = gql`
mutation createUser($input: systemUserInput!) {
  createUser(input: $input) {
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
`

export const UPDATE_USER = gql`
mutation updateUser($input:userInput!) {
  updateUser(input: $input) {
      id
      userName
      image
      address
      email
      phoneNumber
      isDeleted
      roles
  }
}`
