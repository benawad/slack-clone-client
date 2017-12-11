import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Comment } from 'semantic-ui-react';

import FileUpload from '../components/FileUpload';
import RenderText from '../components/RenderText';

const newChannelMessageSubscription = gql`
  subscription($channelId: Int!) {
    newChannelMessage(channelId: $channelId) {
      id
      text
      user {
        username
      }
      url
      filetype
      created_at
    }
  }
`;

const Message = ({ message: { url, text, filetype } }) => {
  if (url) {
    if (filetype.startsWith('image/')) {
      return <img src={url} alt="" />;
    } else if (filetype === 'text/plain') {
      return <RenderText url={url} />;
    } else if (filetype.startsWith('audio/')) {
      return (
        <div>
          <audio controls>
            <source src={url} type={filetype} />
          </audio>
        </div>
      );
    }
  }
  return <Comment.Text>{text}</Comment.Text>;
};

class MessageContainer extends React.Component {
  state = {
    hasMoreItems: true,
  };

  componentWillMount() {
    this.unsubscribe = this.subscribe(this.props.channelId);
  }

  componentWillReceiveProps({ data: { messages }, channelId }) {
    if (this.props.channelId !== channelId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.subscribe(channelId);
    }

    if (
      this.scroller &&
      this.scroller.scrollTop < 20 &&
      this.props.data.messages &&
      messages &&
      this.props.data.messages.length !== messages.length
    ) {
      // 35 items
      const heightBeforeRender = this.scroller.scrollHeight;
      // wait for 70 items to render
      setTimeout(() => {
        if (this.scroller) {
          this.scroller.scrollTop = this.scroller.scrollHeight - heightBeforeRender;
        }
      }, 120);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  subscribe = channelId =>
    this.props.data.subscribeToMore({
      document: newChannelMessageSubscription,
      variables: {
        channelId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }

        return {
          ...prev,
          messages: [subscriptionData.newChannelMessage, ...prev.messages],
        };
      },
    });

  handleScroll = () => {
    const { data: { messages, fetchMore }, channelId } = this.props;
    if (
      this.scroller &&
      this.scroller.scrollTop < 100 &&
      this.state.hasMoreItems &&
      messages.length >= 35
    ) {
      fetchMore({
        variables: {
          channelId,
          cursor: messages[messages.length - 1].created_at,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          if (fetchMoreResult.messages.length < 35) {
            this.setState({ hasMoreItems: false });
          }

          return {
            ...previousResult,
            messages: [...previousResult.messages, ...fetchMoreResult.messages],
          };
        },
      });
    }
  };

  render() {
    const { data: { loading, messages, fetchMore }, channelId } = this.props;
    return loading ? null : (
      <div
        style={{
          gridColumn: 3,
          gridRow: 2,
          paddingLeft: '20px',
          paddingRight: '20px',
          display: 'flex',
          flexDirection: 'column-reverse',
          overflowY: 'auto',
        }}
        onScroll={this.handleScroll}
        ref={(scroller) => {
          this.scroller = scroller;
        }}
      >
        <FileUpload
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
          }}
          channelId={channelId}
          disableClick
        >
          <Comment.Group>
            {messages
              .slice()
              .reverse()
              .map(m => (
                <Comment key={`${m.id}-message`}>
                  <Comment.Content>
                    <Comment.Author as="a">{m.user.username}</Comment.Author>
                    <Comment.Metadata>
                      <div>{m.created_at}</div>
                    </Comment.Metadata>
                    <Message message={m} />
                    <Comment.Actions>
                      <Comment.Action>Reply</Comment.Action>
                    </Comment.Actions>
                  </Comment.Content>
                </Comment>
              ))}
          </Comment.Group>
        </FileUpload>
      </div>
    );
  }
}

const messagesQuery = gql`
  query($cursor: String, $channelId: Int!) {
    messages(cursor: $cursor, channelId: $channelId) {
      id
      text
      user {
        username
      }
      url
      filetype
      created_at
    }
  }
`;

export default graphql(messagesQuery, {
  options: props => ({
    fetchPolicy: 'network-only',
    variables: {
      channelId: props.channelId,
    },
  }),
})(MessageContainer);
