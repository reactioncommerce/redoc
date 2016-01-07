// import apply from "react-es7-mixin/apply"
// import ReMarkdown from "./markdown.jsx";
// import React from "react"

import SearchField from "../docs/search.jsx";
import BranchSelect from "../docs/branchSelect.jsx";


// @apply(ReactMeteorData)
export default DocView = React.createClass({
  // mixins: [ReactMeteorData],

  getMeteorData() {
    const sub = Meteor.subscribe("CacheDocs", this.props.params);

    return {
      docIsLoaded: sub.ready(),
      docs: ReDoc.Collections.TOC.find().fetch(),
      currentDoc: ReDoc.Collections.Docs.findOne()
    };
  },

  handleBranchSelect(branch) {
    if (this.props.history) {
      // this.props.history.pushState({})
    }
  },

  render() {
    return (
      <div className="redoc header">
        <div className="brand">
          <div className="title">Reaction Docs</div>
        </div>
        <div className="navigation"></div>
        <div className="filters">
          <BranchSelect onBranchSelect={this.handleBranchSelect} />
          <SearchField />
        </div>
      </div>
    );
  }
});
