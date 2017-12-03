import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { graphql } from 'react-apollo';

import { getTeamMembersQuery } from '../graphql/team';

const MultiSelectUsers = ({
  data: { loading, getTeamMembers = [] },
  value,
  handleChange,
  placeholder,
  currentUserId,
}) =>
  (loading ? null : (
    <Dropdown
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      fluid
      multiple
      search
      selection
      options={getTeamMembers
        .filter(tm => tm.id !== currentUserId)
        .map(tm => ({ key: tm.id, value: tm.id, text: tm.username }))}
    />
  ));

export default graphql(getTeamMembersQuery, {
  options: ({ teamId }) => ({ variables: { teamId } }),
})(MultiSelectUsers);
