/*
 * scheduled processes so that we don"t don"t endless hit
 * external endpoints
 */

SyncedCron.add({
  name: "Update Github Stargazers",
  schedule: function (parser) {
    return parser.text("every 2 hours");
  },
  job: function () {
    return Meteor.call("util/getRepoData");
  }
});

SyncedCron.add({
  name: "Update Docs Every 3 Days",
  schedule: function (parser) {
    return parser.text("every 3 days");
  },
  job: function () {
    ReDocs.Collections.Docs.remove({});
  }
});

SyncedCron.start();

Meteor.startup(function () {
  // populate TOC from settings
  let TOC = ReDoc.Collections.TOC.find();
  if (TOC.count() === 0) {
    let tocData = Meteor.settings.tocData;
    // if no tocData has been defined, we'll show this projects docs
    if (!tocData) {
      tocData = [{
        class: "guide-nav-item",
        alias: "intro",
        label: "Introduction",
        repoUrl: "https://raw.githubusercontent.com/reactioncommerce/redoc",
        docPath: "README.md",
        repo: "redoc"
      }];
    }

    tocData.forEach(function (tocItem) {
      // Example: https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md
      //         ---0--1-----2------------3-------------4------5-----6-----7------8---------9----XXX
      defaultParams = ReDoc.getPathParams(tocItem.repoUrl);
      if (!tocItem.org) tocItem.org = defaultParams.org;
      if (!tocItem.repo) tocItem.repo = defaultParams.repo;
      if (!tocItem.branch) tocItem.branch = defaultParams.branch || "master";
      if (!tocItem.alias) tocItem.alias = defaultParams.alias;

      ReDoc.Collections.TOC.insert(tocItem);
    });
  }

  // populate REPOS from settings

  let existingRepos = ReDoc.Collections.Repos.find();
  if (existingRepos.count() === 0) {
    let Repos = Meteor.settings.repos;
    // if no tocData has been defined, we'll show this projects docs
    if (!Repos) {
      Repos = [{
        class: "guide-nav-item",
        alias: "Redoc",
        apiUrl: "https://api.github.com/repos/reactioncommerce/redoc"
      }];
    }

    Repos.forEach(function (repoItem) {
      ReDoc.Collections.Repos.insert(repoItem);
      // insert new repoData, with flush enabled
      Meteor.call("util/getRepoData", true);
    });
  }
});
