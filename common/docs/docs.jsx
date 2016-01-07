
import ReMarkdown from "./markdown.jsx";
import TableOfContents from "./toc.jsx";
import SearchResults from "../search/searchResults.jsx";
import "underscore";

export default DocView = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    const sub = Meteor.subscribe("CacheDocs", this.props.params);

    if (Meteor.isClient) {
      const search = DocSearch.getData({
        transform: (matchText, regExp) => {
          return matchText.replace(regExp, "<span class='highlight'>$&</span>");
        },
        sort: {isoScore: -1}
      });

      return {
        docIsLoaded: sub.ready(),
        currentDoc: ReDoc.Collections.Docs.findOne(this.props.params),
        search: search
      };
    }

    if (Meteor.isServer) {
      return {
        docIsLoaded: sub.ready(),
        currentDoc: ReDoc.Collections.Docs.findOne(this.props.params),
        search: []
      };
    }
  },

  handleDocNavigation(href) {
    this.props.history.pushState(null, href);

    // Close the TOC nav on mobile
    if (Meteor.isClient) {
      Session.set("isMenuVisible", false);
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

  renderContent() {
    if (Meteor.isClient && DocSearch.getCurrentQuery()) {
      if (DocSearch.getCurrentQuery().length > 0) {
        return (
          <SearchResults
            branch={this.props.params.branch}
            results={this.data.search}
          />
        );
      }
    }

    // Render standard content
    let content = "";

    if (this.data.currentDoc && this.data.currentDoc.docPageContent) {
      content = this.data.currentDoc.docPageContent;
    }

    return (
      <ReMarkdown content={content} />
    );
  },

  render() {
    let label = "";

    if (this.data.currentDoc) {
      label = this.data.currentDoc.label;
    }

    const pageTitle = `Reaction Docs - ${label}`;

    return (
      <div className="redoc docs">
        <ReactHelmet title={pageTitle} />
        <TableOfContents
          onDocNavigation={this.handleDocNavigation}
          params={this.props.params}
        />

        <div className="content">
          {this.renderContent()}
        </div>
      </div>
    );
  }
});
