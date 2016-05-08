import React from "react";

class SearchField extends React.Component {
  constructor(props) {
    super(props);
    this.displayName = "Search Field";
    this.state = {
      showClearButton: false
    };

    this.handleChange = _.debounce(() => {
      let value = this.refs.input.value;
      DocSearch.search(value);

      if (Meteor.isClient && this.state) {
        if (value.length > 0 && this.state.showClearButton === false) {
          this.setState({showClearButton: true});
        }
      }
    }, 600);

    this.clearSearchQuery = () => {
      DocSearch.search("");
      this.refs.input.value = "";
      this.setState({showClearButton: false});
    };

    this.handleKeyDown = (event) => {
      if (event.keyCode === 27) {
        this.clearSearchQuery();
      }
    };
  }

  renderClearButton() {
    if (Meteor.isClient && this.state) {
      if (this.state.showClearButton) {
        return (
          <button className="btn btn-default" onClick={this.clearSearchQuery}>
            <i className="fa fa-times-circle"></i>
          </button>
        );
      }
    }
  }

  render() {
    return (
      <div className="redoc control search">
        <div className="icon left">
          <i className="fa fa-search"></i>
        </div>
        <input
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
          placeholder="Search"
          ref="input"
        />
        {this.renderClearButton()}
      </div>
    );
  }
}

export default SearchField;
