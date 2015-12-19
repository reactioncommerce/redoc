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
    Docs.remove({});
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
        docPath: "docs/index.md"
      }];
    }

    tocData.forEach(function (tocItem) {
      ReDoc.Collections.TOC.insert(tocItem);
      let docPage = tocItem.repoUrl + "/" + "master" + "/" + tocItem.docPath;
      Meteor.call("util/getGHDoc", docPage);
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
