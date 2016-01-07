
// TODO: move search results into this component, currentlu in docs/docs.jsx

export default SearchResults = React.createClass({

  handleChange(event) {
    let value = event.target.value;
    console.log("search string", value);
    DocSearch.search(value);
  },

  handleFocus() {

  },

  handleBlur() {

  },

  render() {
    return (
      <div className="redoc search-results">

      </div>
    );
  }
})
