//
// Meteor Methods
//

Meteor.methods({
  /**
   *  util/flushDocCache
   *  fetch repo profile from github and store in RepoData collection
   *  @param {Boolean} option - if true we'll flush the existing repo records first
   *  @returns {undefined} returns
   */
  "util/flushDocCache": function () {
    ReDoc.Collections.TOC.remove({});
    ReDoc.Collections.Docs.remove({});
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
  },
  /**
   *  util/getRepoData
   *  fetch repo profile from github and store in RepoData collection
   *  @param {Boolean} option - if true we'll flush the existing repo records first
   *  @returns {undefined} returns
   */
  "util/getRepoData": function (option) {
    this.unblock();
    check(option, Match.Optional(Boolean));

    let flush = option || true;
    let repos = ReDoc.Collections.Repos.find().fetch();
    // gather multiple repo gh profiles
    for (let repo of repos) {
      // get repo urls ands stats
      let result = Meteor.http.get(repo.apiUrl, {
        headers: {
          "User-Agent": "ReDoc/1.0"
        }
      });

      // get updated release tags
      let release = Meteor.http.get(result.data.tags_url, {
        headers: {
          "User-Agent": "ReDoc/1.0"
        }
      });

      // if flush, delete first
      if (flush === true && result.data) {
        ReDoc.Collections.RepoData.remove({});
      }

      if (result.data) {
        ReDoc.Collections.RepoData.insert({
          data: result.data,
          release: release.data,
          createdAt: new Date()
        });
      }
    }
  }
});
