
import ReMarkdown from "./markdown.jsx";
import SearchResults from "../search/searchResults.jsx";
import classnames from "classnames";
import "underscore";

export default DocView = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    let data = {};
    const tocSub = Meteor.subscribe("TOC");

    if (Meteor.isClient) {
      data = {
        tocIsLoaded: tocSub.ready(),
        docs: ReDoc.Collections.TOC.find().fetch(),
        isMenuVisible: Session.get("isMenuVisible")
      };
    }

    if (Meteor.isServer) {
      Meteor.subscribe("TOC");
      data = {
        tocIsLoaded: tocSub.ready(),
        docs: ReDoc.Collections.TOC.find().fetch()
      };
    }

    return data;
  },

  handleDocNavigation(event) {
    event.preventDefault();

    if (this.props.onDocNavigation) {
      this.props.onDocNavigation(event.target.href);
    }
  },

  renderMenu() {
    const items = this.data.docs.map((item) => {
      const branch = this.props.params.branch || "development";
      const url = `/${item.repo}/${branch}/${item.alias}`;

      return (
        <li className={item.class}>
          <a href={url} onClick={this.handleDocNavigation}>{item.label}</a>
        </li>
      );
    });

    return items;
  },

  render() {
    const classes = classnames({
      redoc: true,
      navigation: true,
      visible: this.data.isMenuVisible
    });

    return (
        <div className={classes}>
            <div className="menu">
              <ul>
                <li className="reaction-nav-item primary">
                  <img className="logo" src="/images/logo.png" />
                  <a className="nav-link" href="https://reactioncommerce.com">{"Reaction"}</a>
                </li>
                <li className="reaction-nav-item"><a className="nav-link" href="https://reactioncommerce.com/features">{"Features"}</a></li>
                <li className="reaction-nav-item"><a className="nav-link" href="https://reactioncommerce.com/partners">{"Partners"}</a></li>
                <li className="reaction-nav-item"><a className="nav-link active" href="https://docs.reactioncommerce.com">{"Docs"}</a></li>
                <li className="reaction-nav-item"><a className="nav-link" href="https://reactioncommerce.com/about">{"About"}</a></li>
                <li className="reaction-nav-item"><a className="nav-link" href="http://blog.reactioncommerce.com">{"Blog"}</a></li>

                {this.renderMenu()}
              </ul>
            </div>
        </div>
    );
  }
});
