import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const Home = ({ data: { allUsers = [] } }) => allUsers.map(u => <h1 key={u.id}>{u.email}</h1>);

const allUsersQuery = gql`
  {
    allUsers {
      id
      email
    }
  }
`;

export default graphql(allUsersQuery)(Home);
