import React from "react";
import Helmet from "react-helmet";
import Header from "./header";


export default class BaseLayout extends React.Component {

  handleOverlayClose() {
    if (Meteor.isClient) {
      Session.set("isMenuVisible", false);
    }
  }

  // TODO: Make this better, smarter, useable for more than just the menu
  renderOverlayForMenu() {
    if (this.props.isMenuVisible) {
      return (
        <div
          className="redoc overlay"
          onClick={this.handleOverlayClose}
        />
      );
    }
  }

  render() {
    return (
      <div className="redoc page">
        <Helmet
          meta={[
            {name: "viewport", content: "width=device-width"},
            {property: "og:title", content: Meteor.settings.public.redoc.meta.title},
            {property: "og:description", content: Meteor.settings.public.redoc.meta.description},
            {property: "og:url", content: Meteor.settings.public.redoc.meta.url},
            {property: "og:image", content: Meteor.settings.public.redoc.meta.image}
          ]}
          link={[
            {rel: "canonical", href: Meteor.settings.public.redoc.meta.url},
            {rel: "icon", href: Meteor.settings.public.redoc.meta.favicon, type: "type/png"}
          ]}
          title={Meteor.settings.public.redoc.title}
        />

        <Header
          history={this.props.history}
          params={this.props.params}
          user={this.props.user}
        />
        {React.cloneElement(this.props.children, {
          user: this.props.user,
          isMenuVisible: this.props.isMenuVisible
        })}
        {this.renderOverlayForMenu()}
      </div>
    );
  }
}
