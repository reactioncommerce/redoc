import Header from "./header/header.jsx";

export default BaseLayout = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    let data = {
      isMenuVisible: false
    };

    if (Meteor.isClient) {
      data.isMenuVisible = Session.equals("isMenuVisible", true);
    }

    return data;
  },

  handleOverlayClose() {
    if (Meteor.isClient) {
      Session.set("isMenuVisible", false);
    }
  },

  // TODO: Make this better, smarter, useable for more than just the menu
  renderOverlayForMenu() {
    if (this.data.isMenuVisible) {
      return (
        <div
          className="redoc overlay"
          onClick={this.handleOverlayClose}
        />
      );
    }
  },

  renderTopNavigation() {
    return (
      <div className="navigation">
        <a className="nav-link" href="https://reactioncommerce.com/features">{"Features"}</a>
        <a className="nav-link" href="https://reactioncommerce.com/partners">{"Partners"}</a>
        <a className="nav-link active" href="https://docs.reactioncommerce.com">{"Docs"}</a>
        <a className="nav-link" href="https://reactioncommerce.com/about">{"About"}</a>
        <a className="nav-link" href="http://blog.reactioncommerce.com">{"Blog"}</a>
      </div>
    );
  },

  render() {
    return (
      <div className="redoc page">
        {/*this.renderTopNavigation()*/}
        <Header
          history={this.props.history}
          params={this.props.params}
        />
        {this.props.children}
        {this.renderOverlayForMenu()}
      </div>
    );
  }
});
