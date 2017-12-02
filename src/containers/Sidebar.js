import React from 'react';

import Channels from '../components/Channels';
import Teams from '../components/Teams';
import AddChannelModal from '../components/AddChannelModal';
import InvitePeopleModal from '../components/InvitePeopleModal';
import DirectMessageModal from '../components/DirectMessageModal';

export default class Sidebar extends React.Component {
  state = {
    openAddChannelModal: false,
    openInvitePeopleModal: false,
    openDirectMessageModal: false,
  };

  toggleDirectMessageModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState(state => ({ openDirectMessageModal: !state.openDirectMessageModal }));
  };

  toggleAddChannelModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState(state => ({ openAddChannelModal: !state.openAddChannelModal }));
  };

  toggleInvitePeopleModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState(state => ({ openInvitePeopleModal: !state.openInvitePeopleModal }));
  };

  render() {
    const {
      teams, team, username, currentUserId,
    } = this.props;
    const { openInvitePeopleModal, openAddChannelModal, openDirectMessageModal } = this.state;

    const regularChannels = [];
    const dmChannels = [];

    team.channels.forEach((c) => {
      if (c.dm) {
        dmChannels.push(c);
      } else {
        regularChannels.push(c);
      }
    });

    return [
      <Teams key="team-sidebar" teams={teams} />,
      <Channels
        key="channels-sidebar"
        teamName={team.name}
        username={username}
        teamId={team.id}
        channels={regularChannels}
        dmChannels={dmChannels}
        onAddChannelClick={this.toggleAddChannelModal}
        onInvitePeopleClick={this.toggleInvitePeopleModal}
        onDirectMessageClick={this.toggleDirectMessageModal}
        isOwner={team.admin}
      />,
      <DirectMessageModal
        teamId={team.id}
        onClose={this.toggleDirectMessageModal}
        open={openDirectMessageModal}
        key="sidebar-direct-message-modal"
        currentUserId={currentUserId}
      />,
      <AddChannelModal
        teamId={team.id}
        onClose={this.toggleAddChannelModal}
        open={openAddChannelModal}
        key="sidebar-add-channel-modal"
        currentUserId={currentUserId}
      />,
      <InvitePeopleModal
        teamId={team.id}
        onClose={this.toggleInvitePeopleModal}
        open={openInvitePeopleModal}
        key="invite-people-modal"
      />,
    ];
  }
}
