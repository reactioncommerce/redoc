
export default BranchSelect = React.createClass({

  handleChange(event) {
    if (this.props.onBranchChange) {
      this.props.onBranchChange(event.target.value);
    }
  },

  render() {
    return (
      <div className="redoc control select">
        <select onChange={this.handleChange} ref="select">
          <option value="development">development</option>
          <option value="master">master</option>
        </select>
      </div>
    );
  }
});
