import {Meteor} from "meteor/meteor";
import React from "react";
import {browserHistory} from "react-router";
import Avatar from "./avatar.jsx";
import classnames from "classnames";

class RedocAdmin extends React.Component {
  constructor(props) {
    super(props);

    this.handleGithubSignIn = () => {
      Meteor.loginWithGithub({}, (error) => {
        if (error) {
          /* eslint no-console: 0 */
          console.log(error);
        }
      });
    };

    this.handleDocReload = () => {
      if (confirm("Reload the docs? This may disrupt users currently browsing.")) {
        Meteor.call("redoc/flushDocCache");
      }
    };

    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut() {
    Meteor.logout();
    browserHistory.push("/");
  }

  renderLogin() {}

  renderNavigation() {
    const classes = classnames({
      redoc: true,
      sidebar: true,
      visible: this.props.isMenuVisible
    });

    const links = [
      {
        label: "Homepage",
        href: Meteor.absoluteUrl()
      }
    ];

    let menu = links.map((link, index) => {
      const linkClassName = classnames(link, { "guide-nav-item": true });

      return (
        <li className={linkClassName} key={index}>
          <a href={link.href}>{link.label}</a>
        </li>
      );
    });

    return (
      <div className={classes}>
        <div className="menu">
          <ul>
            <li className="reaction-nav-item primary" key="tocHeader">
              <img className="logo" src={Meteor.settings.public.redoc.logo.image}/>
              <a className="nav-link" href={Meteor.settings.public.redoc.logo.link.href}>
                {Meteor.settings.public.redoc.logo.link.value}
              </a>
            </li>
            {menu}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    // Render admin dashboard
    if (Meteor.userId()) {
      let badges = [];

      if (Roles.userIsInRole(Meteor.userId(), "admin", "redoc")) {
        badges.push(<i className="fa fa-star"/>);
      }

      if (Roles.userIsInRole(Meteor.userId(), "paparazzi", "redoc")) {
        badges.push(<i className="fa fa-camera-retro"/>);
      }

      let githubUserId = "";

      if (this.props.user && this.props.user.services) {
        const {github} = this.props.user.services;
        githubUserId = github.id;
      }
      console.log("github userID", githubUserId);
      return (
        <div className="redoc admin">
          {this.renderNavigation()}

          <div className="content" id="main-content">
            <div className="card">
              <div className="section primary">
                <Avatar githubUserId={githubUserId}/>
              </div>
              <div className="badges section primary">
                {badges}
              </div>
              <div className="controls section">
                <button className="btn btn-default" onClick={this.handleSignOut}>Sign Out</button>
              </div>
            </div>

            <div className="card">
              <div className="section primary">
                <h3>Tools</h3>
              </div>
              <div className="section">
                <button className="btn btn-danger" onClick={this.handleDocReload}>Reload All Docs</button>
              </div>
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
            <button className="btn btn-default" onClick={this.loginWithGithub}>
              <i className="fa fa-github"></i>
              {"Sign in with Github"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

RedocAdmin.propTypes = {
  isMenuVisible: React.PropTypes.bool,
  user: React.PropTypes.object
};

export default RedocAdmin;
export {RedocAdmin};
