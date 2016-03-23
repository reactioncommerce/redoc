// Meteor.publish("Docs", function () {
//   return ReDoc.Collections.Docs.find();
// });

Meteor.publish("userData", function () {
  return Meteor.users.find({
    _id: this.userId
  }, {
    fields: {
      "services.github.id": 1
    }
  });
});

Meteor.publish("TOC", function () {
  return ReDoc.Collections.TOC.find({}, {
    sort: {
      position: 1
    }
  });
});

Meteor.publish("Repos", function () {
  return ReDoc.Collections.Repos.find();
});

/*
 *  CacheDocs returns all docs, filter by branch
 *  checks if request docs exists first then pulls new data if there is none
 */
Meteor.publish("CacheDocs", function (docParams) {
  // some minor validation
  check(docParams, {
    repo: Match.Optional(String, null),
    branch: Match.Optional(String, null),
    alias: Match.Optional(String, null)
  });

  let params = {};
  const defaultToc = ReDoc.Collections.TOC.findOne({
    default: true
  });

  // Set params for doc fetching
  params.repo = docParams.repo || defaultToc.repo;
  params.branch = docParams.branch || Meteor.settings.public.redoc.branch || "master";
  params.alias = docParams.alias || defaultToc.alias;

  // get repo details
  let docRepo = ReDoc.Collections.Repos.findOne({
    repo: params.repo
  });

  // default doc repo
  if (!docRepo) {
    docRepo = ReDoc.Collections.Repos.findOne();
  }
  if (!docRepo) {
    console.log("CacheDocs Publication: Failed to load repo data for document cache request", params);
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

  // check if we need to fetch new docs
  if (cacheDoc.count() === 0 && docTOC) {
    Meteor.call("redoc/getDocSet", params.repo, params.branch);
  }
  // return cache doc
  return cacheDoc;
});
