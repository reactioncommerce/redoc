//
// Meteor Methods
//

Meteor.methods({
  /**
   *  redoc/initRepoData
   *  fetch repo and toc fixtures from private/redoc.json
   *  @returns {undefined} returns
   */
  "redoc/initRepoData": function () {
    let initRepoData =  EJSON.parse(Assets.getText(Meteor.settings.redoc.initRepoData || "redoc.json"));
    // populate TOC from settings
    let TOC = ReDoc.Collections.TOC.find();
    if (TOC.count() === 0) {
      let tocData = initRepoData.tocData;
      // if no tocData has been defined, we'll show this projects docs
      if (!tocData) {
        tocData = [{
          class: "guide-nav-item",
          alias: "intro",
          label: "Introduction",
          repo: "redoc",
          docPath: "README.md",
          default: true
        }];
      }

      tocData.forEach(function (tocItem) {
        // Example: https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md
        //         ---0--1-----2------------3-------------4------5-----6-----7------8---------9----XXX
        // defaultParams = ReDoc.getPathParams(tocItem.repoUrl);
        // if (!tocItem.org) tocItem.org = defaultParams.org;
        // if (!tocItem.repo) tocItem.repo = defaultParams.repo;
        // if (!tocItem.branch) tocItem.branch = defaultParams.branch || "master";
        // if (!tocItem.alias) tocItem.alias = defaultParams.alias;
        console.log("initRepoData", tocItem.org, tocItem.repo);
        ReDoc.Collections.TOC.insert(tocItem);
      });
    }

    //
    // populate REPOS from settings
    //
    let existingRepos = ReDoc.Collections.Repos.find();
    if (existingRepos.count() === 0) {
      let Repos = initRepoData.repos;
      // if no tocData has been defined, we'll show this projects docs
      if (!Repos) {
        Repos = [{
          class: "guide-nav-item",
          repo: "redoc",
          label: "Redoc",
          apiUrl: "https://api.github.com/repos/reactioncommerce/redoc",
          rawUrl: "https://raw.githubusercontent.com/reactioncommerce/redoc/"
        }];
      }

      Repos.forEach(function (repoItem) {
        ReDoc.Collections.Repos.insert(repoItem);
        // insert new repoData, with flush enabled
      });
      // Run once will get all repo data for current repos
      Meteor.call("redoc/getRepoData", true);
    }
  },
  /**
   *  redoc/flushDocCache
   *  fetch repo profile from github and store in RepoData collection
   *  @param {Boolean} option - if true we'll flush the existing repo records first
   *  @returns {undefined} returns
   */
  "redoc/flushDocCache": function () {
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
   *  redoc/getRepoData
   *  fetch repo profile from github and store in RepoData collection
   *
   *  @param {Boolean} option - if true we'll flush the existing repo records first
   *  @returns {undefined} returns
   */
  "redoc/getRepoData": function () {
    this.unblock();

    let repos = ReDoc.Collections.Repos.find().fetch();
    // gather multiple repo gh profiles
    for (let repo of repos) {
      // should we maybe clean off prefix?
      apiUrl = repo.apiUrl || `https://api.github.com/repos/${repo.org}/${repo.repo}`;
      rawUrl = repo.rawUrl || `https://raw.githubusercontent.com/${repo.org}/${repo.repo}`;

      // get repo urls ands stats
      let repoData = Meteor.http.get(apiUrl, {
        headers: {
          "User-Agent": "ReDoc/1.0"
        }
      });

      if (repoData.data) {
        // get updated release tags
        let releaseData = Meteor.http.get(repoData.data.tags_url, {
          headers: {
            "User-Agent": "ReDoc/1.0"
          }
        });

        if (releaseData.data) {
          ReDoc.Collections.Repos.upsert({
            _id: repo._id
          }, {
            $set: {
              repo: repo.repo,
              org: repo.org,
              label: repo.label || result.data.name,
              description: repo.description || repoData.data.description,
              data: repoData.data,
              apiUrl: apiUrl || repoData.data.url,
              rawUrl: rawUrl,
              release: releaseData.data
            }
          });
        }
      }
    } // end loop
  }
});
