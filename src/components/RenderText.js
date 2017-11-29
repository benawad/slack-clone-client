import React from 'react';

export default class RenderText extends React.Component {
  state = {
    text: '',
  };

  componentWillMount = async () => {
    const response = await fetch(this.props.url);
    const text = await response.text();
    this.setState({ text });
  };

  render() {
    const { text } = this.state;
    return (
      <div>
        <div>-----</div>
        <p>{text}</p>
        <div>-----</div>
      </div>
    );
  }
}
