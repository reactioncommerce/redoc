import "underscore";

export default SearchResults = React.createClass({
  renderResults() {
    if (_.isArray(this.props.results)) {
      const results = this.props.results.map((item) => {
        const branch = this.props.branch || "development";
        const url = `/${item.repo}/${branch}/${item.alias}`;
        const html = {
          __html: item.docPageContentHTML
        };

        return (
          <li>
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
        <h2 className="title">Search Results</h2>
        <ul>
          {this.renderResults()}
        </ul>
      </div>
    );
  }
});
