import { gql } from '@apollo/client';

export const GET_ME = gql`
    query getME($username: String) {
        me(username: $username) {
            _id
            username
            email
            bookCount
            savedBooks
        }
    }
`;