import React from "react";
import classnames from "classnames";
import "underscore";

export default DocView = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    let data = {};
    const tocSub = Meteor.subscribe("TOC");

    if (Meteor.isClient) {
      data = {
        tocIsLoaded: tocSub.ready(),
        docs: ReDoc.Collections.TOC.find({}, {
          sort: {
            position: 1
          }
        }).fetch(),
        isMenuVisible: Session.get("isMenuVisible")
      };
    }

    if (Meteor.isServer) {
      data = {
        tocIsLoaded: tocSub.ready(),
        docs: ReDoc.Collections.TOC.find({}, {
          sort: {
            position: 1
          }
        }).fetch()
      };
    }

    return data;
  },

  handleDocNavigation(event) {
    event.preventDefault();

    if (this.props.onDocNavigation) {
      this.props.onDocNavigation(event.currentTarget.href);
    }
  },

  renderMainNavigationLinks(active) {
    let links = [];
    let index = 0;
    for (link of Meteor.settings.public.redoc.mainNavigationLinks) {
      let className = (link.href === active || link.value === active) ? "nav-link active" : "nav-link";
      links.push(
        <li className="reaction-nav-item" key={index++}>
          <a className={className} href={link.href}>{link.value}</a>
        </li>
      );
    }
    return links;
  },

  renderMenu() {
    const items = this.data.docs.map((item) => {
      const branch = this.props.params.branch || Meteor.settings.public.redoc.branch || "master";
      const url = `/${item.repo}/${branch}/${item.alias}`;

      let subList;

      if (item.documentTOC) {
        const subItems = item.documentTOC.map((subItem, index) => {
          const key = `${subItem.label}-${index}`;

          return (
            <li className={subItem.className} key={key}>
              <a href={subItem.docPath} >{subItem.label}</a>
            </li>
          );
        });

        const subItemClassName = classnames({
          hidden: this.props.params.alias !== item.alias
        });

        subList = (
          <ul className={subItemClassName}>
            {subItems}
          </ul>
        );
      }

      return (
        <li className={item.class} key={item._id}>
          <a href={url} onClick={this.handleDocNavigation}>{item.label}</a>

          {subList}
        </li>
      );
    });

    return items;
  },

  render() {
    const classes = classnames({
      redoc: true,
      navigation: true,
      visible: this.data.isMenuVisible
    });

    return (
        <div className={classes}>
            <div className="menu">
              <ul>
                <li className="reaction-nav-item primary" key="tocHeader">
                  <img className="logo" src={Meteor.settings.public.redoc.logo.image} />
                  <a className="nav-link" href={Meteor.settings.public.redoc.logo.link.href}>{Meteor.settings.public.redoc.logo.link.value}</a>
                </li>
                {this.renderMainNavigationLinks("Docs")}
                {this.renderMenu()}
              </ul>
            </div>
        </div>
    );
  }
});
