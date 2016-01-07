

export default SearchField = React.createClass({
  // mixins: [ReactMeteorData],

  getIniitalState() {
    return {
      showClearButton: false
    };
  },

  // getMeteorData() {
  //   if (Meteor.isClient) {
  //     return {
  //       searchQuery: DocSearch.getCurrentQuery()
  //     };
  //   }
  //
  //   return {
  //     searchQuery: ""
  //   };
  // },

  handleChange(event) {
    let value = event.target.value;
    DocSearch.search(value);

    if (Meteor.isClient && this.state) {
      if (value.length > 0 && this.state.showClearButton === false) {
        this.setState({showClearButton: true});
      }
    }
  },

  clearSearchQuery() {
    DocSearch.search("");
    this.setState({showClearButton: false});
  },

  renderClearButton() {
    if (Meteor.isClient && this.state) {
      if (this.state.showClearButton) {
        return (
          <button onClick={this.clearSearchQuery}>
            <i className="fa fa-times"></i>
          </button>
        );
      }
    }
  },

  render() {
    return (
      <div className="redoc control search">
        <div className="icon left">
          <i className="fa fa-search"></i>
        </div>
        <input
          onBlur={this.handleBlur}
          onChange={_.throttle(this.handleChange)}
          onFocus={this.handleFocus}
          placeholder="Search"
          ref="input"
        />
        {this.renderClearButton()}
      </div>
    );
  }
});
