import { Meteor } from "meteor/meteor";
import React from "react";
import { browserHistory } from "react-router";
import Avatar from "./avatar.jsx"

class RedocAdmin extends React.Component {
  constructor(props) {
    super(props);

    this.handleGithubSignIn = () => {
      Meteor.loginWithGithub({}, (error) => {
        if (error) {
          console.log(error);
        }
      });
    };

    this.handleSignOut = () => {
      Meteor.logout();
      browserHistory.push("/");
    };

    this.handleDocReload = () => {
      if(confirm("Reload the docs? This may disrupt users currently browsing.")) {
        Meteor.call("redoc/flushDocCache");
      }
    };
  }

  renderLogin() {

  }

  render() {
    // Render admin dashboard
    if (Meteor.userId()) {
      let badges = [];

      if (Roles.userIsInRole(Meteor.userId(), "admin", "redoc")) {
        badges.push(
          <i className="fa fa-star" />
        );
      }

      if (Roles.userIsInRole(Meteor.userId(), "paparazzi", "redoc")) {
        badges.push(
          <i className="fa fa-camera-retro" />
        );
      }

      let githubUserId = "";

      if (this.props.user && this.props.user.services) {
        const { github } = this.props.user.services;
        githubUserId = github.id;
      }

      return (
        <div className="redoc admin">
          <div className="card">
            <div className="section primary">
              <Avatar githubUserId={githubUserId} />
            </div>
            <div className="badges section">
              {badges}
            </div>
            <div className="controls section">
              <button className="btn btn-default" onClick={this.handleGithubSignIn}>Sign Out</button>
            </div>
          </div>

          <div className="card">
            <div className="section primary">
              <h2>Tools</h2>
            </div>
            <div className="section">
              <button className="btn btn-danger" onClick={this.handleDocReload}>Reload All Docs</button>
            </div>
          </div>
        </div>
      );
    }

    // Render Login
    return (
      <div className="redoc admin">
        <div className="card">
          <div className="section">
            <button className="btn btn-default" onClick={this.handleGithubSignIn}>
              <i className="fa fa-github"></i> {"Sign in with Github"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

RedocAdmin.propTypes = {
  user: React.PropTypes.object
};

export default RedocAdmin;
export { RedocAdmin };
