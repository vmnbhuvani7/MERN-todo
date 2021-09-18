import gql from "graphql-tag";

export const FORGOT_PASSWORD = gql`
mutation forgotPassword ($email: String){
  forgotPassword(email: $email)
}
`
export const RESET_PASSWORD = gql`
mutation resetPassword ($input: resetPasswordInput!){
  resetPassword(input: $input)
}
`
