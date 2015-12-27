/*
 *  Docs, see data.js to add docs
 */
/* eslint dot-notation: 0*/
Template.docs.helpers({

  docTOC: function () {
    return ReDoc.Collections.TOC.find();
  },

  docPageContent: function () {
    // the Docs are filtered in publication
    let doc = ReDoc.Collections.Docs.findOne();
    if (doc && typeof doc.docPageContent !== "undefined") {
      return doc.docPageContent;
    } else if (doc) {
      return `Getting fresh content from [${doc.repo}](${doc.docPage})`;
    }
    return "";
  },
  isSelectedDoc: function () {
    if (this.alias === FlowRouter.getParam("alias")) {
      return "selected";
    }
    return "";
  },

  currentBranch: function () {
    return FlowRouter.getParam("branch") || "master";
  },

  isCurrentBranch: function (branch, returnValueIfTrue, returnValueIfFalse) {
    return branch === FlowRouter.getParam("branch") ? returnValueIfTrue : returnValueIfFalse;
  },

  isFirst: function () {
    return $("ul .selected").is(":first-child");
  },
  isLast: function () {
    return $("ul .selected").is(":last-child");
  }
});

Template.docs.events({
  /* "click #next-doc": function(event, template) {
    var doc, nextDoc;
    nextDoc = $(".selected").next("li");
    if (nextDoc.length > 0) {
      doc = nextDoc.children().attr("data-doc");
      $("li").removeClass("selected");
      nextDoc.addClass("selected");
      Session.set("docPage", doc);
    }
  },
  "click #prev-doc": function(event, template) {
    var doc, prevDoc;
    prevDoc = $(".selected").prev("li");
    if (prevDoc.length > 0) {
      doc = prevDoc.children().attr("data-doc");
      branch = prevDoc.children().attr("data-branch");
      $("li").removeClass("selected");
      prevDoc.addClass("selected");
      Session.set("docPage", doc);
    }
  },*/
  // Handle markdown anchors that we don't want
  // to redirect off the documentation site
  "click .markdown a": function (event) {
    event.preventDefault();
    event.stopPropagation();

    const path = $(event.currentTarget).attr("href");
    // check to see if we can load
    if (path.substr(path.length - 3) === ".md") {
      try {
        let params = ReDoc.getPathParams(path);
        FlowRouter.setParams({
          repo: params.repo,
          branch: params.branch,
          alias: params.alias
        });
      } catch (error) {
        return window.open(path, "_blank");
      }
    }
    // return window.open(path, "_blank");
  }
});
