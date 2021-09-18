import gql from "graphql-tag";

export const GETADMINUSERS = gql`
query getAdminUsers ($page: Int, $limit: Int, $search: String) {
    getAdminUsers (page: $page, limit: $limit, search: $search) {
      count
      data{
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