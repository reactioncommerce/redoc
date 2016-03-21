import { Meteor } from "meteor/meteor";
import React from "react";
import { browserHistory } from "react-router";

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
  }

  renderLogin() {

  }

  render() {
    // Render admin dashboard
    if (Meteor.userId()) {
      return (
        <div>
          <img></img>
          <button className="btn btn-default" onClick={this.handleGithubSignIn}>Sign Out</button>
        </div>
      );
    }

    // Render Login
    return (
      <div>
        <button className="btn btn-default" onClick={this.handleGithubSignIn}>Sign in with Github</button>
      </div>
    );
  }
}

export default RedocAdmin;
export { RedocAdmin };
