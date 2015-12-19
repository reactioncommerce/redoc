docPageFromCurrentRoute = function () {
  const branch = FlowRouter.getParam("branch");
  const alias = FlowRouter.getParam("alias");

  let tocItem = ReDoc.Collections.TOC.findOne({
    alias: alias
  });
  // if this is a new page
  if (tocItem) {
    return tocItem.repoUrl + "/" + branch + "/" + tocItem.docPath;
  }
  // existing url
  return FlowRouter.current().path;
};

/*
 *  Docs, see data.js to add docs
 */
 /* eslint dot-notation: 0*/
Template.docs.helpers({

  docTOC: function () {
    return ReDoc.Collections.TOC.find();
  },

  docPageContent: function () {
    let docPageUrl = docPageFromCurrentRoute();
    if (docPageUrl) {
      let doc = ReDoc.Collections.Docs.findOne({
        docPage: docPageUrl
      });

      if (doc && typeof doc.docPageContent !== "undefined") {
        marked.setOptions({
          highlight: function (code) {
            return hljs.highlightAuto(code).value;
          }
        });

        return doc.docPageContent;
      }
      if (docPageUrl.includes("github")) {
        Meteor.call("util/getGHDoc", docPageUrl);
        return false;
      }
      // we return false here because we've
      // already got the content
      return false;
    }
    // we didn't have a doc url, this is default document
    let defaultRepo = ReDoc.Collections.Repos.findOne();
    FlowRouter.setParams({
      branch: defaultRepo.defaultBranch,
      alias: defaultRepo.defaultAlias
    });
  },
  isSelectedDoc: function () {
    if (this.alias === FlowRouter.getParam("alias")) {
      return true;
    }
    return false;
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

  branch: function () {
    return FlowRouter.getParam("branch");
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
  "click .guide-nav-item,.guide-sub-nav-item": function () {
    let branch = FlowRouter.getParam("branch");

    FlowRouter.setParams({
      branch: branch,
      alias: this.alias
    });
  },
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

  "change select[name='branch-select']": function (event) {
    let branch = event.currentTarget.value;
    FlowRouter.setParams({
      branch: branch,
      alias: FlowRouter.getParam("alias")
    });
  },

  "click .markdown a": function (event) {
    event.preventDefault();
    event.stopPropagation();

    const path = $(event.currentTarget).attr("href");

    if (path.substr(path.length - 3) === ".md") {
      try {
        // Example: https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md
        //         ---0--1-----2------------3-------------4------5-----6-----7------8---------9----XXX
        const parts = path.split("/");
        const org = parts[3];
        const repo = parts[4];
        const branch = parts[6];
        const doc = parts[7] + "/" + parts[8];
        const alias = parts[9].replace(".md", "");

        FlowRouter.setParams({
          branch: branch,
          alias: branch
        });
      } catch (error) {
        return window.open(path, "_blank");
      }
    }

    return window.open(path, "_blank");
  }
});
