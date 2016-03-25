import React from "react";
import _ from "underscore";

export default BranchSelect = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    let branches = [];
    let repo = ReDoc.Collections.Repos.findOne({ repo: this.props.repo }) || ReDoc.Collections.Repos.findOne();

    if (repo && repo.branches) {
      const isAdminUser = Roles.userIsInRole(Meteor.userId(), ["admin"], "redoc");

      for (branch of repo.branches) {
        if (Meteor.settings.public.redoc.publicBranches) {
          const isPublicBranch = _.contains(Meteor.settings.public.redoc.publicBranches, branch.name);

          if (isPublicBranch || isAdminUser) {
            branches.push(branch.name);
          }
        } else {
          branches.push(branch.name);
        }
      }
    }

    return {
      branches: branches
    };
  },

  renderBranches() {
    return this.data.branches.map((branch, index) => {
      return (
        <option key={index} value={branch}>{branch}</option>
      );
    });
  },

  handleChange(event) {
    if (this.props.onBranchSelect) {
      this.props.onBranchSelect(event.target.value);
    }
  },

  render() {
    if (this.data.branches.length > 0) {
      return (
        <div className="redoc control select">
          <select
            onChange={this.handleChange}
            ref="select"
            value={this.props.currentBranch}
            id="branch-select"
          >
            {this.renderBranches()}
          </select>
          <div className="icon right">
            <i className="fa fa-angle-down"></i>
          </div>
        </div>
      );
    }

    return (
      <div className="loading">{"Loading..."}</div>
    );
  }
});
