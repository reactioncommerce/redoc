Meteor.methods({
  /**
   *  util/clearDocCache
   *  fetch repo profile from github and store in RepoData collection
   *  @param {Boolean} option - if true we'll flush the existing repo records first
   *  @returns {undefined} returns
   */
  "util/clearDocCache": function () {
    ReDoc.Collections.TOC.remove({});

    let TOC = ReDoc.Collections.TOC.find();
    if (TOC.count() === 0) {
      docData.forEach(function (tocItem) {
        ReDoc.Collections.TOC.insert(tocItem);
        let docPage = tocItem.repoUrl + "/" + "master" + "/" + tocItem.docPath;
        Meteor.call("util/getGHDoc", docPage);
      });
    }
  },

  /**
   *  util/getGHDoc
   *  fetch docs from github
   *  and store in docs collection
   *  docPage = "/" + org + "/" + repo + "/" + branch + "/" + doc;
   *  @param {String} docPage - source url of markdown page to fetch into cache
   *  @returns {String} docPage - returns docPage
   */
  "util/getGHDoc": function (docPage) {
    this.unblock();
    // some minor validation
    check(docPage, String);

    // sensible defaults for every repo
    let alias = docPage.substring(docPage.lastIndexOf("/") + 1).split(".").slice(0, -1).join(".").toLowerCase();
    let label = alias.charAt(0).toUpperCase() + alias.slice(1);
    let org = docPage.split("/").slice(3, 4).join("/");
    let repo = docPage.split("/").slice(4, 5).join("/");
    let branch = docPage.split("/").slice(5, 6).join("/");

    let docCache = ReDoc.Collections.Docs.findOne({
      docPage: docPage
    });

    // our simple little caching mechanism
    if (docCache !== undefined) {
      return docPage;
    }

    // else lets fetch that Github repo
    Meteor.http.get(docPage, function (error, result) {
      if (error) return error;
      if (result.statusCode === 200) {
        return ReDoc.Collections.Docs.upsert({
          docPage: docPage
        }, {
          $set: {
            org: org,
            repo: repo,
            branch: branch,
            alias: alias,
            label: label,
            docPage: docPage,
            docPageContent: result.content
          }
        });
      }
    });
    return docPage;
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
