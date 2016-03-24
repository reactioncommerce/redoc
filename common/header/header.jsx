import React from "react";
import SearchField from "../search/search.jsx";
import BranchSelect from "../docs/branchSelect.jsx";
import { composeWithTracker } from 'react-komposer';
import Avatar from "meteor/reactioncommerce:redoc-core/components/avatar.jsx"

const DocView = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  mixins: [ReactMeteorData],

  getMeteorData() {
    Meteor.subscribe("TOC");

    let data = {
      isMenuVisible: true,
      defaultDoc: ReDoc.Collections.TOC.findOne({default: true})
    };

    if (Meteor.isClient) {
      data.isMenuVisible = Session.equals("isMenuVisible", true);
    }

    return data;
  },

  handleBranchSelect(selectedBranch) {
    if (this.context.router) {
      const branch = selectedBranch || this.props.params.branch || Meteor.settings.public.redoc.branch || "master";
      const params = this.props.params;
      const repo = params.repo || this.data.defaultDoc.repo;
      const alias = params.alias || this.data.defaultDoc.alias;
      const url = `/${repo}/${branch}/${alias}`;

      window.location.href = url;
    }
  },

  handleMenuToggle() {
    if (Meteor.isClient) {
      if (Session.equals("isMenuVisible", true)) {
        Session.set("isMenuVisible", false);
      } else {
        Session.set("isMenuVisible", true);
      }
    }
  },

  renderMainNavigationLinks(active) {
    let links = [];
    let index = 0;
    for (link of Meteor.settings.public.redoc.mainNavigationLinks) {
      let className = (link.href === active || link.value === active) ? "nav-link active" : "nav-link";
      links.push(<a className={className} href={link.href} key={index++}>{link.value}</a>);
    }
    return links;
  },

  renderSignedInUser() {
    if (this.props.user && this.props.user.services) {
      const githubUserId = this.props.user.services.github.id;
      const imageUrl = `https://avatars.githubusercontent.com/u/${githubUserId}?s=460`
      return (
        <div className="navbar-item user">
          <a href="/redoc">
            <Avatar githubUserId={githubUserId} />
          </a>
        </div>
      );
    }
  },

  render() {
    return (
      <div className="redoc header">

        <div className="navigation">
          {this.renderMainNavigationLinks("Docs")}
        </div>

        <div className="main-header">
          <div className="navbar-item brand">
            <button className="redoc menu-button" onClick={this.handleMenuToggle}>
              <i className="fa fa-bars"></i>
            </button>
            <a className="title" href={Meteor.settings.public.redoc.logo.link.href}>
              <img className="logo" src={Meteor.settings.public.redoc.logo.image} />
              {Meteor.settings.public.redoc.logo.link.value}
            </a>
          </div>

          <div className="navbar-item filters">
            <div className="item">
              <BranchSelect
                repo={this.props.params.repo}
                currentBranch={this.props.params.branch || Meteor.settings.public.redoc.branch || "master"}
                onBranchSelect={this.handleBranchSelect}
              />
            </div>
            <div className="item">
              <SearchField />
            </div>
          </div>

          {this.renderSignedInUser()}
        </div>
      </div>
    );
  }
});

export default DocView;
