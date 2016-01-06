import Header from "./header/header.jsx";

export default class BaseLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="redoc page">
        <Header></Header>
        {this.props.children}
      </div>
    );
  }
}
