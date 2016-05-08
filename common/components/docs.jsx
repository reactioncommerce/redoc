import React from "react";
import Helmet from "react-helmet";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import TableOfContents from "../containers/toc";
import SearchResults from "./searchResults";

export default class Docs extends React.Component {

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
  }

  handleDocRefresh() {
    const { currentDoc, params } = this.props;

    Meteor.call("redoc/reloadDoc", {
      _id: currentDoc._id,
      branch: params.branch,
      alias: params.alias,
      repo: params.repo
    });
  }

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
  }

  renderContent() {
    if (Meteor.isClient && DocSearch.getCurrentQuery()) {
      if (DocSearch.getCurrentQuery().length > 0) {
        return (
          <SearchResults
            branch={this.props.params.branch}
            results={this.props.search}
          />
        );
      }
    }
    if (this.props.docIsLoaded) {
      // Render standard content
      if (this.props.currentDoc && this.props.currentDoc.docPageContentHTML) {
        let content = {
          __html: this.props.currentDoc.docPageContentHTML
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
  }

  renderAdminTools() {
    if (Roles.userIsInRole(Meteor.userId(), ["admin"], "redoc") && this.props.currentDoc) {
      const { org, repo, branch, docPath} = this.props.currentDoc;
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
  }

  render() {
    let label = "";

    if (this.props.currentDoc) {
      label = this.props.currentDoc.label;
    }

    const pageTitle = `${Meteor.settings.public.redoc.title} - ${label}`;

    return (
      <div className="redoc docs">
        <Helmet
          title={pageTitle}
        />
        <TableOfContents
          onDocNavigation={this.handleDocNavigation.bind(this)}
          params={this.props.params}
        />

        <div className="content" id="main-content">
          {this.renderAdminTools()}
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

Docs.contextTypes = {
  router: React.PropTypes.object.isRequired
};

// TODO: fix propTypes check so it works properly across client/server
// Docs.propTypes = {
//   currentDoc: React.PropTypes.object,
//   docIsLoaded: React.PropTypes.oneOfType([
//     React.PropTypes.func,   // client
//     React.PropTypes.boolean // server
//   ]),
//   history: React.PropTypes.object,
//   params: React.PropTypes.object,
//   search: React.PropTypes.array
// };
