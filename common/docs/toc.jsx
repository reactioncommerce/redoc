
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
      const search = DocSearch.getData({
        transform: (matchText, regExp) => {
          return matchText.replace(regExp, "<span class='highlight'>$&</span>");
        },
        sort: {isoScore: -1}
      });

      data = {
        tocIsLoaded: tocSub.ready(),
        docs: ReDoc.Collections.TOC.find().fetch(),
        search: search,
        isMenuVisible: Session.get("isMenuVisible")
      };
    }

    if (Meteor.isServer) {
      Meteor.subscribe("TOC");
      data = {
        tocIsLoaded: tocSub.ready(),
        docs: ReDoc.Collections.TOC.find().fetch(),
        search: []
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
                {this.renderMenu()}
              </ul>
            </div>
        </div>
    );
  }
});
