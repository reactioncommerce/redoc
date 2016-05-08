import React from "react";
import classnames from "classnames";
import "underscore";
import s from "underscore.string";

export default class TableOfContents extends React.Component {

  handleDocNavigation(event) {
    event.preventDefault();

    if (this.props.onDocNavigation) {
      this.props.onDocNavigation(event.currentTarget.href);
    }
  }

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
  }

  renderMenu(parentPath) {
    let items = [];
    let parentItems = _.filter(this.props.docs, function(item) { return item.parentPath === parentPath });
    if (parentItems.length === 0) {
      return [];
    }

    for (let item of parentItems) {
      const branch = this.props.params.branch || Meteor.settings.public.redoc.branch || "master";
      const url = `/${item.repo}/${branch}/${item.alias}`;

      let subList;

      if (item.documentTOC) {
        subItems = item.documentTOC.map((subItem, index) => {
          const hashUrl = `${url}#${subItem.slug}`;

          return (
            <li className={subItem.className} key={index}>
              <a href={hashUrl}>{subItem.label}</a>
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

      const className = item.class || (parentPath ? "guide-sub-nav-item" : "guide-nav-item");
      const classes = classnames({
        [className]: true,
        active: this.props.params.alias === item.alias
      });

      items.push(
        <li className={classes} key={`${branch}-${item._id}`}>
          <a href={url} onClick={this.handleDocNavigation.bind(this)}>{item.label}</a>
          {subList}
        </li>
      );

      let currentPath = s.strLeftBack(item.docPath, "/README.md"); // Dirs path has /README.md attached to them
      items = items.concat(this.renderMenu(currentPath));
    }

    return items;
  }

  render() {
    const classes = classnames({
      redoc: true,
      sidebar: true,
      visible: this.props.isMenuVisible
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
}
