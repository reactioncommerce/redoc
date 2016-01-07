import apply from "react-es7-mixin/apply"
import ReMarkdown from "./markdown.jsx";
import "underscore";

export default DocView = React.createClass({
  mixins: [ReactMeteorData],

  componentDidMount() {
  },

  componentWillReceiveProps(props) {

  },

  getMeteorData() {
    if (Meteor.isClient) {
      const sub = Meteor.subscribe("Docs");
      const tocSub = Meteor.subscribe("TOC");
      const search = DocSearch.getData({
        transform: function(matchText, regExp) {

          const pos = matchText.search(regExp)

          let text = matchText.replace(regExp, "<span class='highlight'>$&</span>")
          console.log(pos, Math.max(pos - 80, 0), Math.min(40, text.length - 1));
          const excerpt = text.substring(
            Math.max(pos - 80, 0),
            Math.min(pos + 41, text.length - 1)
          );
          // return matchText;
          return `...${excerpt}...`;
        },
        sort: {isoScore: -1}
      });

      return {
        docIsLoaded: sub.ready(),
        tocIsLoaded: tocSub.ready(),
        docs: ReDoc.Collections.TOC.find().fetch(),
        currentDoc: ReDoc.Collections.Docs.findOne(this.props.params),
        search: search
      };
    }

    if (Meteor.isServer) {
      let search

      return {
        docIsLoaded: true,
        tocIsLoaded: true,
        docs: ReDoc.Collections.TOC.find().fetch(),
        currentDoc: ReDoc.Collections.Docs.findOne(),
        search: search
      };
    }
  },

  handleDocNavigation(event) {
    event.preventDefault();
    // console.log(event.target.href);
    console.log(this.props);
    this.props.history.pushState({null}, event.target.href);
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
    if (_.isArray(this.data.search) && this.data.search.length === 0) {
      let content = "";

      if (this.data.currentDoc && this.data.currentDoc.docPageContent) {
        content = this.data.currentDoc.docPageContent;
      }

      return (
        <ReMarkdown content={content} />
      );
    } else if (_.isArray(this.data.search) && DocSearch.getCurrentQuery().length) {
      const results = this.data.search.map((item) => {
        const branch = this.props.params.branch || "development";
        const url = `/${item.repo}/${branch}/${item.alias}`;

        return (
          <li>
            <a href={url}><strong>{item.label}</strong></a>
            <ReMarkdown content={item.docPageContent} />
          </li>
        );
      })

      return (
        <div className="redoc search-results">
          <ul>
            {results}
          </ul>
        </div>
      );
    }
  },

  render() {
    let label = "";

    if (this.data.currentDoc) {
      label = this.data.currentDoc.label;
    }

    const pageTitle = `Reaction Docs - ${label}`;



    console.log("Search Results", this.data.search);

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
          {this.renderContent()}
        </div>
      </div>
    );
  }
});
