import gql from "graphql-tag";

export const GETADMINUSERS = gql`
query getAdminUsers ($page: Int, $limit: Int, $search: String, $filter: String) {
  getAdminUsers (page: $page, limit: $limit, search: $search, filter:$filter) {
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