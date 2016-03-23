import React from "react"
import ReactDom from "react-dom";
import Helmet from "react-helmet";
import TableOfContents from "./toc.jsx";
import SearchResults from "../search/searchResults.jsx";
import { browserHistory } from 'react-router'
import _ from "underscore";

export default DocView = React.createClass({
  propTypes: {
    alias: React.PropTypes.string,
    branch: React.PropTypes.string,
    history: React.PropTypes.object,
    repo: React.PropTypes.string,
    params: React.PropTypes.any
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  mixins: [ReactMeteorData],

  shouldComponentUpdate(nextProps) {
    const {branch, alias, repo} = this.props;
    const {nBranch, nAlias, nRepo} = nextProps;

    if (branch === nBranch && alias === nAlias && repo === nRepo) {
      return false;
    }

    return true;
  },

  componentDidUpdate() {
    this.scrollToElement();
  },

  getMeteorData() {
    const sub = Meteor.subscribe("CacheDocs", this.props.params);

    if (Meteor.isClient) {
      const search = DocSearch.getData({
        transform: (matchText, regExp) => {
          return matchText.replace(regExp, "<span class='highlight'>$&</span>");
        }
      });

      // If no params have been given, load params from default TOC
      let params = this.props.params;
      if (Object.keys(params).length === 0) {
        let defaultToc = ReDoc.Collections.TOC.findOne({ default: true });
        if (!!defaultToc) {
          params.repo = defaultToc.repo;
          params.branch = defaultToc.branch;
          params.alias = defaultToc.alias;
        }
      }

      return {
        docIsLoaded: sub.ready(),
        currentDoc: ReDoc.Collections.Docs.findOne(params),
        search: search
      };
    }

    if (Meteor.isServer) {
      return {
        docIsLoaded: true,
        currentDoc: ReDoc.Collections.Docs.findOne(this.props.params),
        search: []
      };
    }
  },

  handleDocNavigation(href) {
    if (href) {
      // strip tld to prevent pushState warning
      let path = "/" + href.replace(/^(?:\/\/|[^\/]+)*\//, "");
      this.context.router.push(path);

      // Close the TOC nav on mobile
      if (Meteor.isClient) {
        Session.set("isMenuVisible", false);
        DocSearch.search("");
      }
    }
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
    if (this.data.docIsLoaded) {
      // Render standard content
      if (this.data.currentDoc && this.data.currentDoc.docPageContentHTML) {
        let content = {
          __html: this.data.currentDoc.docPageContentHTML
        };

        return (
          <div className="content-html" dangerouslySetInnerHTML={content}></div>
        );
      }

      return (
        <div className="content-html">
          <h2>{"Requested document not found for this version."}</h2>
        </div>
      );
    }
  },

  scrollToElement() {
    if (Meteor.isClient) {
      if (window.location.hash) {
        const hashParts = window.location.hash.split("#");

        if (hashParts.length >= 2) {
          const hash = hashParts[hashParts.length - 1];
          const element = document.getElementById(hash);

          if (element) {
            const top = Math.floor(element.getBoundingClientRect().top);
            const content = document.getElementById("main-content");

            content.scrollTop = top;
          }
        }
      }
    }
  },

  render() {
    let label = "";
    if (this.data.currentDoc) {
      label = this.data.currentDoc.label;
    }

    const pageTitle = `${Meteor.settings.public.redoc.title} - ${label}`;

    return (
      <div className="redoc docs">
        <Helmet
          title={pageTitle}
        />
        <TableOfContents
          onDocNavigation={this.handleDocNavigation}
          params={this.props.params}
        />

        <div className="content" id="main-content">
          {this.renderContent()}
        </div>
      </div>
    );
  }
});
