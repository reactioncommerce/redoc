import SearchField from "../search/search.jsx";
import BranchSelect from "../docs/branchSelect.jsx";

export default DocView = React.createClass({
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
    if (this.props.history) {
      const branch = selectedBranch || this.props.params.branch || "development";
      const params = this.props.params;
      const url = `/${params.repo}/${branch}/${params.alias}`;

      this.props.history.pushState(null, url);
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

  render() {
    return (
      <div className="redoc header">
        <div className="brand">
          <button className="redoc menu-button" onClick={this.handleMenuToggle}>
            <i className="fa fa-bars"></i>
          </button>
          <a className="title" href="/">
            <img className="logo" src="/images/logo.png" />
            {"Reaction Docs"}
          </a>
        </div>
        <div className="navigation"></div>
        <div className="filters">
          <div className="item">
            <BranchSelect
              currentBranch={this.props.params.branch}
              onBranchSelect={this.handleBranchSelect}
            />
          </div>
          <div className="item">
            <SearchField />
          </div>
        </div>
      </div>
    );
  }
});
