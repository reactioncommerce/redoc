import React from "react";
import _ from "underscore";

export default SearchResults = React.createClass({
  handleSearchClear() {
    DocSearch.search("");
  },

  renderResults() {
    if (_.isArray(this.props.results)) {
      const results = this.props.results.map((item, index) => {
        const branch = this.props.branch || Meteor.settings.public.redoc.branch || "master";
        const url = `/${item.repo}/${branch}/${item.alias}`;
        const html = {
          __html: item.docPageContentHTML
        };

        return (
          <li key={index}>
            <div className="header">
              <a href={url}><strong>{item.label}</strong></a>
            </div>
            <div className="content-html" dangerouslySetInnerHTML={html} />
          </li>
        );
      });

      return results;
    }
  },

  render() {
    return (
      <div className="redoc search-results">
        <h2 className="title">{"Search Results"}</h2>
        <ul>
          {this.renderResults()}
        </ul>
      </div>
    );
  }
});
