// import Select from "react-select";


export default BranchSelect = React.createClass({

  handleChange(event) {
    if (this.props.onBranchChange) {
      this.props.onBranchChange(event.target.value)
    }
  },

  handleFocus() {

  },

  handleBlur() {

  },

  render() {
    return (
      <div className="redoc branchselect">
        <select onChange={this.handleChange}>
          <option value="development">development</option>
          <option value="master">master</option>
        </select>
      </div>
    );
  }
})
