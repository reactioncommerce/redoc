


export default SearchField = React.createClass({

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
      <div className="redoc control search">
        <div className="icon">
          <i className="fa fa-search"></i>
        </div>
        <input
          onChange={_.throttle(this.handleChange)}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          placeholder="Search"
        />
      </div>
    );
  }
})
