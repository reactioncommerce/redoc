// import apply from "react-es7-mixin/apply"
// import ReMarkdown from "./markdown.jsx";
// import React from "react"

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




  render() {


    return (
      <div className="redoc header">
        <div className="title">Reaction Docs</div>
      </div>
    );
  }
});
