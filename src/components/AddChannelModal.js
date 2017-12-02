import React from 'react';
import { Checkbox, Form, Input, Button, Modal } from 'semantic-ui-react';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';

import { meQuery } from '../graphql/team';
import MultiSelectUsers from './MultiSelectUsers';

const AddChannelModal = ({
  open,
  onClose,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  resetForm,
  setFieldValue,
  teamId,
  currentUserId,
}) => (
  <Modal
    open={open}
    onClose={(e) => {
      resetForm();
      onClose(e);
    }}
  >
    <Modal.Header>Add Channel</Modal.Header>
    <Modal.Content>
      <Form>
        <Form.Field>
          <Input
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            name="name"
            fluid
            placeholder="Channel name"
          />
        </Form.Field>
        <Form.Field>
          <Checkbox
            value={!values.public}
            label="Private"
            onChange={(e, { checked }) => setFieldValue('public', !checked)}
            toggle
          />
        </Form.Field>
        {values.public ? null : (
          <Form.Field>
            <MultiSelectUsers
              value={values.members}
              handleChange={(e, { value }) => setFieldValue('members', value)}
              teamId={teamId}
              placeholder="select members to invite"
              currentUserId={currentUserId}
            />
          </Form.Field>
        )}
        <Form.Group widths="equal">
          <Button
            disabled={isSubmitting}
            fluid
            onClick={(e) => {
              resetForm();
              onClose(e);
            }}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit} fluid>
            Create Channel
          </Button>
        </Form.Group>
      </Form>
    </Modal.Content>
  </Modal>
);

const createChannelMutation = gql`
  mutation($teamId: Int!, $name: String!, $public: Boolean, $members: [Int!]) {
    createChannel(teamId: $teamId, name: $name, public: $public, members: $members) {
      ok
      channel {
        id
        name
      }
    }
  }
`;

export default compose(
  graphql(createChannelMutation),
  withFormik({
    mapPropsToValues: () => ({ public: true, name: '', members: [] }),
    handleSubmit: async (values, { props: { onClose, teamId, mutate }, setSubmitting }) => {
      await mutate({
        variables: {
          teamId,
          name: values.name,
          public: values.public,
          members: values.members,
        },
        optimisticResponse: {
          createChannel: {
            __typename: 'Mutation',
            ok: true,
            channel: {
              __typename: 'Channel',
              id: -1,
              name: values.name,
            },
          },
        },
        update: (store, { data: { createChannel } }) => {
          const { ok, channel } = createChannel;
          if (!ok) {
            return;
          }

          const data = store.readQuery({ query: meQuery });
          const teamIdx = findIndex(data.me.teams, ['id', teamId]);
          data.me.teams[teamIdx].channels.push(channel);
          store.writeQuery({ query: meQuery, data });
        },
      });
      onClose();
      setSubmitting(false);
    },
  }),
)(AddChannelModal);
