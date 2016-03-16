import React from "react";
import SearchField from "../search/search.jsx";
import BranchSelect from "../docs/branchSelect.jsx";

export default DocView = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  mixins: [ReactMeteorData],

  getMeteorData() {
    let data = {
      isMenuVisible: true
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
      const url = `/${params.repo}/${branch}/${params.alias}`;

      // this.context.router.push(url);
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

  render() {
    return (
      <div className="redoc header">

        <div className="navigation">
          {this.renderMainNavigationLinks('Docs')}
        </div>

        <div className="main-header">
          <div className="brand">
            <button className="redoc menu-button" onClick={this.handleMenuToggle}>
              <i className="fa fa-bars"></i>
            </button>
            <a className="title" href={Meteor.settings.public.redoc.logo.link.href}>
              <img className="logo" src={Meteor.settings.public.redoc.logo.image} />
              {Meteor.settings.public.redoc.logo.link.value}
            </a>
          </div>

          <div className="filters">
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
        </div>
      </div>
    );
  }
});
