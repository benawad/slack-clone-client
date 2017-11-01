import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Messages from '../components/Messages';

const MessageContainer = ({ data: { loading, messages } }) =>
  (loading ? null : <Messages>{JSON.stringify(messages)}</Messages>);

const messagesQuery = gql`
  query($channelId: Int!) {
    messages(channelId: $channelId) {
      id
      text
      user {
        username
      }
      createdAt
    }
  }
`;

export default graphql(messagesQuery, {
  variables: props => ({
    channelId: props.channelId,
  }),
})(MessageContainer);
