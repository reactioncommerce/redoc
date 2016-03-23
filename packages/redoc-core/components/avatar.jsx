import React from "react";

class Avatar extends React.Component {
  render() {
    if (this.props.githubUserId) {
      const imageUrl = `https://avatars.githubusercontent.com/u/${this.props.githubUserId}?s=460`
      return (
        <div className="redoc profile-image">
          <img src={imageUrl} />
        </div>
      );
    }

    return (
      <div className="redoc profile-image blank"></div>
    );
  }
}

export default Avatar;
