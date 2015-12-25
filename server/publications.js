Meteor.publish("Docs", function () {
  return ReDoc.Collections.Docs.find();
});

Meteor.publish("TOC", function () {
  return ReDoc.Collections.TOC.find();
});

Meteor.publish("Repos", function () {
  return ReDoc.Collections.Repos.find();
});

/*
 *  CacheDocs gets retrieves a single doc page from GitHub
 *  pulls new data if there is none
 */
Meteor.publish("CacheDocs", function (params) {
  // some minor validation
  check(params, {
    repo: Match.Optional(String, null),
    branch: Match.Optional(String, null),
    alias: Match.Optional(String, null)
  });

  // if we have no params, we're the root document
  if (Object.keys(params).length === 0) {
    defaultDoc = ReDoc.Collections.TOC.findOne({
      default: true
    });
    params.repo = defaultDoc.repo;
    params.branch = "master";
    params.alias = defaultDoc.alias;
  }

  // get repo details
  let docRepo = ReDoc.Collections.Repos.findOne({
    repo: params.repo
  });

  if (!docRepo) {
    docRepo = ReDoc.Collections.Repos.findOne();
  }

  // assemble TOC
  let docTOC = ReDoc.Collections.TOC.findOne({
    alias: params.alias,
    repo: params.repo
  });

  // find specific branch in Docs
  let cacheDoc = ReDoc.Collections.Docs.find({
    repo: params.repo,
    branch: params.branch,
    alias: params.alias
  });

  // check if we need to fetch a new doc
  if (cacheDoc && cacheDoc.count() === 0) {
    let docSourceUrl = `${docRepo.rawUrl}/${params.branch}/${docTOC.docPath}`;

    // else lets fetch that Github repo
    Meteor.http.get(docSourceUrl, function (error, result) {
      if (error) return error;
      if (result.statusCode === 200) {
        // sensible defaults for every repo
        let docSet = ReDoc.getPathParams(docSourceUrl);
        docSet.docPage = docSourceUrl;
        docSet.docPageContent = result.content;
        // if TOC has different alias, we'll use that
        if (docTOC.alias) {
          docSet.alias = docTOC.alias;
        }
        // insert new documentation into Cache
        return ReDoc.Collections.Docs.upsert({
          docPage: docSourceUrl
        }, {
          $set: docSet
        });
      }
    });
  }
  // return cache doc
  return cacheDoc;
});

/*
 *  RepoData gets all the repo data reactioncommerce/reaction
 *  pulls new data if there is none
 */

// Meteor.publish("RepoData", function () {
//   let repoData = ReDoc.Collections.RepoData.find({}, {
//     sort: {
//       createdAt: 1
//     }
//   });
//   if (repoData.count() === 0) {
//     Meteor.call("redoc/getRepoData");
//   }
//   return repoData;
// });
