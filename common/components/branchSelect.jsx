import React, { Component, PropTypes } from "react";
import _ from "underscore";

export default class BranchSelect extends Component {

  renderBranches() {
    return _.map(this.props.branches, (branchGroup, groupIndex) => {
      let tags;
      let branches;

      if (Array.isArray(branchGroup.branches)) {
        // if (branchGroup.branches.length === 0) {
        //   return null;
        // }

        branches = branchGroup.branches.map((branch, index) => {
          return (
            <option key={`branch-${index}`} value={branch.commit || branch.name}>{branch.name}</option>
          );
        });
      }

      if (Array.isArray(branchGroup.tags)) {
        tags = branchGroup.tags.map((tag, index) => {
          return (
            <option key={`tag-${index}`} value={tag.url}>{tag.name}</option>
          );
        });
      }


      return (
        <optgroup key={`group-${groupIndex}`} label={branchGroup.name}>
          {branches}
          {tags}
        </optgroup>
      );
    });
  }


  handleChange(event) {
    if (this.props.onBranchSelect) {
      this.props.onBranchSelect(event.target.value);
    }
  }

  render() {
    if (this.props.branches) {
      return (
        <div className="redoc control select">
          <select
            onChange={this.handleChange.bind(this)}
            ref="select"
            value={this.props.currentBranch}
            id="branch-select"
          >
            {this.renderBranches()}
          </select>
          <div className="icon right">
            <i className="fa fa-angle-down" />
          </div>
        </div>
      );
    }

    return (
      <div className="loading">{"Loading..."}</div>
    );
  }
}

BranchSelect.propTypes = {
  branches: PropTypes.object
};
