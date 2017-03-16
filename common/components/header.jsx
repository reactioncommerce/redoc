import React from "react";
import SearchField from "./search";
import BranchSelect from "../containers/branchSelect";
import Avatar from "meteor/reactioncommerce:redoc-core/components/avatar";
import classnames from "classnames";

const DocView = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      showNavDropdown: false,
      showMobileNavigation: false
    }
  },

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

  handleShowMobileNavigation() {
    this.setState({
      showMobileNavigation: !this.state.showMobileNavigation
    })
  },

  handleShowNavDropdown() {
    this.setState({
      showNavDropdown: !this.state.showNavDropdown
    })
  },

  renderToolbar() {
    return (
      <div className="redoc header">
        <div className="main-header">
          <div className="navbar-item brand">
            <button className="redoc menu-button" onClick={this.handleMenuToggle}>
              <i className="fa fa-bars"></i>
            </button>
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
        </div>
      </div>
    );
  },

  render() {
    const dropDownClassName = classnames({
      "reaction-nav-dropdown-links": true,
      "active": this.state.showNavDropdown
    })

    const dropDownToggleClassName = classnames({
      "reaction-nav-link": true,
      "reaction-nav-dropdown-toggle": true,
      "flipped": this.state.showNavDropdown
    })

    const navLinksClassName = classnames({
      "reaction-nav-group": true,
      "reaction-nav-links": true,
      "reaction-nav-links-show": this.state.showMobileNavigation
    })

    const menuToggleClassName = classnames({
      "reaction-nav-toggle": true,
      "active": this.state.showMobileNavigation
    })

    return (
      <div className="header">
        <nav className="reaction-nav" role="navigation">
          <div className="reaction-nav-group reaction-nav-header">
            <a href="/" className="reaction-nav-item">
              <img src="/images/logo.png" alt="Reaction" />
              <span>Reaction Commerce</span>
            </a>
          </div>

          <div className={navLinksClassName}>
            <div className="nav-links-left">
              <a href="https://reactioncommerce.com/features" className="reaction-nav-link">Features</a>
              <div className="reaction-nav-dropdown">
                <a href="#" className={dropDownToggleClassName}
                   data-event-action="showNavDropdown" onClick={this.handleShowNavDropdown}>
                  Developers
                </a>
                <ul className={dropDownClassName}>
                  <li>
                    <a href="https://github.com/reactioncommerce/reaction">
                      <img src="/images/header/download-icon.svg" />
                      Download
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.reactioncommerce.com/reaction-docs/master/tutorial">
                      <img src="/images/header/customize-icon.svg" />
                      Customize
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.reactioncommerce.com/reaction-docs/master/contributing-to-reaction">
                      <img src="/images/header/fork-icon.svg" />
                      Contribute
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.reactioncommerce.com">
                      <img src="/images/header/docs-icon.svg" />
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="https://forums.reactioncommerce.com/">
                      <img src="/images/header/forum-icon.svg" />
                      Forums
                    </a>
                  </li>
                  <li>
                    <a href="https://gitter.im/reactioncommerce/reaction">
                      <img src="/images/header/chat-icon.svg" />
                      Chat
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <a href="https://docs.reactioncommerce.com" className="reaction-nav-link reaction-nav-link-docs">
              <img src="/images/header/docs-icon.svg" height="22px" />
              Docs
            </a>
            <a className="reaction-btn" href="https://reactioncommerce.com/features#get-a-demo">
              Get a demo
              <div className="btn__arrow"></div>
            </a>
          </div>

          <div className="reaction-nav-group reaction-nav-final">
            <button type="button" className={menuToggleClassName} data-event-action="showMobileNavigation" onClick={this.handleShowMobileNavigation}>
              Menu
            </button>
          </div>
        </nav>
        {this.renderToolbar()}
      </div>
    )
  }
});

export default DocView;
