
export default BranchSelect = React.createClass({

  handleChange(event) {
    if (this.props.onBranchSelect) {
      this.props.onBranchSelect(event.target.value);
    }
  },

  render() {
    return (
      <div className="redoc control select">
        <select
          onChange={this.handleChange}
          ref="select"
          value={this.props.currentBranch}
        >
          <option value="development">development</option>
          <option value="master">master</option>
        </select>
        <div className="icon right">
          <i className="fa fa-angle-down"></i>
        </div>
      </div>
    );
  }
});
