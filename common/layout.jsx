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

  render() {
    return (
      <div className="redoc page">
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
