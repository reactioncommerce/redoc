/*
 *  Docs, see data.js to add docs
 */
/* eslint dot-notation: 0*/
Template.docs.helpers({

  docTOC: function () {
    return ReDoc.Collections.TOC.find();
  },

  docPageContent: function () {
    let params = {
      repo: FlowRouter.getParam("repo"),
      branch: FlowRouter.getParam("branch"),
      alias: FlowRouter.getParam("alias")
    };
    let doc = ReDoc.Collections.Docs.findOne(params);
    if (doc && typeof doc.docPageContent !== "undefined") {
      marked.setOptions({
        highlight: function (code) {
          return hljs.highlightAuto(code).value;
        }
      });
      return doc.docPageContent;
    }
  },
  isSelectedDoc: function () {
    if (this.alias === FlowRouter.getParam("alias")) {
      return "selected";
    }
    return "";
  },

  branches: function () {
    const repos = ReDoc.Collections.RepoData.find().fetch();
    const branches = ["master"];
    // let's get all the default
    for (let repo of repos) {
      branches.push(repo.data.default_branch);
    }
    return branches;
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
  // "click .guide-nav-item,.guide-sub-nav-item": function () {
  //   console.log(this)
  //   // let goToUrl = "" + this.repo + "/" + this.branch + "/" + this.alias;
  //   // ensure route is correct
  //   // FlowRouter.setParams({
  //   //   repo: this.repo,
  //   //   branch: this.branch,
  //   //   alias: this.alias
  //   // });
  //   console.log("nav object", this)
  // },
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
