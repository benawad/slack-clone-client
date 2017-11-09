import gql from 'graphql-tag';

export const meQuery = gql`
  {
    me {
      id
      username
      teams {
        id
        name
        admin
        channels {
          id
          name
        }
      }
    }
  }
`;

export const idk = {};
