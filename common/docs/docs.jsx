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

  componentDidUpdate() {
    // this.scrollToElement();
  },

  getMeteorData() {
    const sub = Meteor.subscribe("CacheDocs", this.props.params);

    if (Meteor.isClient) {
      const search = DocSearch.getData({
        transform: (matchText, regExp) => {
          return matchText.replace(regExp, "<span class='highlight'>$&</span>");
        }
      });

      return {
        docIsLoaded: sub.ready(),
        currentDoc: ReDoc.Collections.Docs.findOne(this.props.params),
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

    if (href.indexOf("#") > -1) {
      this.scrollToElement();
    }
  },

  handleDocRefresh() {
    Meteor.call("redoc/reloadDoc", {
      _id: this.data.currentDoc._id,
      branch: this.props.params.branch,
      alias: this.props.params.alias,
      repo: this.props.params.repo
    });
  },

  scrollToElement() {
    if (Meteor.isClient) {
      if (window.location.hash) {
        console.log("winow", window.location.hash);
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
          <div className="redoc spinner-container">
            <div className="redoc spinner"></div>
          </div>
        </div>
      );
    }
  },

  renderAdminTools() {
    if (Roles.userIsInRole(Meteor.userId(), ["admin"], "redoc") && this.data.currentDoc) {
      const { org, repo, branch, docPath} = this.data.currentDoc;
      const githubUrl = `https://github.com/${org}/${repo}/tree/${branch}/${docPath}`;

      return (
        <div className="redoc toolbar">
          <a className="btn" href={githubUrl} target="_blank">
            Edit on Github
          </a>
          <button className="btn" onClick={this.handleDocRefresh}>
            Refresh Doc
          </button>
        </div>
    );
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
          {this.renderAdminTools()}
          {this.renderContent()}
        </div>
      </div>
    );
  }
});
