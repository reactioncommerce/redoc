import apply from "react-es7-mixin/apply"
import ReMarkdown from "./markdown.jsx";
import "underscore";

export default DocView = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    let sub = Meteor.subscribe("CacheDocs", this.props.params);
    const tocSub = Meteor.subscribe("TOC");

    return {
      docIsLoaded: sub.ready(),
      tocIsLoaded: tocSub.ready(),
      docs: ReDoc.Collections.TOC.find().fetch(),
      currentDoc: ReDoc.Collections.Docs.findOne()
    };
  },

  handleDocNavigation(event) {
    event.preventDefault();
    this.props.history.pushState(null, event.target.href);
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
    let label = "";
    let content = "";

    if (this.data.currentDoc) {
      label = this.data.currentDoc.label;
    }

    const pageTitle = `Reaction Docs - ${label}`;

    if (this.data.currentDoc && this.data.currentDoc.docPageContent) {
      content = this.data.currentDoc.docPageContent;
    }

    return (
      <div className="redoc docs">
        <ReactHelmet title={pageTitle} />
        <div className="navigation">
            <div className="menu">
              <ul>
                {this.renderMenu()}
              </ul>
            </div>
        </div>

        <div className="content">
          <ReMarkdown content={content} />
        </div>
      </div>
    );
  }
});
