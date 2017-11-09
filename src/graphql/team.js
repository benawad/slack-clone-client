import gql from 'graphql-tag';

export const meQuery = gql`
  {
    me {
      id
      username
      teams {
        id
        name
        channels {
          id
          name
        }
      }
    }
  }
`;

export const idk = {};
