import React from 'react';
import { Form, Input, Button, Modal } from 'semantic-ui-react';
import Downshift from 'downshift';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

const DirectMessageModal = ({
  history,
  open,
  onClose,
  teamId,
  data: { loading, getTeamMembers },
}) => (
  <Modal open={open} onClose={onClose}>
    <Modal.Header>Add Channel</Modal.Header>
    <Modal.Content>
      <Form>
        <Form.Field>
          {!loading && (
            <Downshift
              onChange={(selectedUser) => {
                history.push(`/view-team/user/${teamId}/${selectedUser.id}`);
                onClose();
              }}
            >
              {({
                getInputProps,
                getItemProps,
                isOpen,
                inputValue,
                selectedItem,
                highlightedIndex,
              }) => (
                <div>
                  <Input {...getInputProps({ placeholder: 'Favorite color ?' })} fluid />
                  {isOpen ? (
                    <div style={{ border: '1px solid #ccc' }}>
                      {getTeamMembers
                        .filter(i =>
                            !inputValue ||
                            i.username.toLowerCase().includes(inputValue.toLowerCase()))
                        .map((item, index) => (
                          <div
                            {...getItemProps({ item })}
                            key={item.id}
                            style={{
                              backgroundColor: highlightedIndex === index ? 'gray' : 'white',
                              fontWeight: selectedItem === item ? 'bold' : 'normal',
                            }}
                          >
                            {item.username}
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
              )}
            </Downshift>
          )}
        </Form.Field>
        <Button fluid onClick={onClose}>
          Cancel
        </Button>
      </Form>
    </Modal.Content>
  </Modal>
);

const getTeamMembersQuery = gql`
  query($teamId: Int!) {
    getTeamMembers(teamId: $teamId) {
      id
      username
    }
  }
`;

export default withRouter(graphql(getTeamMembersQuery)(DirectMessageModal));
