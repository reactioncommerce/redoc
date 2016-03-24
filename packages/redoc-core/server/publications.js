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

  // Set params defaults
  params.repo = docParams.repo;
  params.alias = docParams.alias;
  params.branch = docParams.branch || Meteor.settings.public.redoc.branch || "master";

  // Set params for doc if docParams is empty using the default doc params
  if (Object.keys(docParams).length === 0) {
    const defaultToc = ReDoc.Collections.TOC.findOne({
      default: true
    });

    params.repo = defaultToc.repo;
    params.alias = defaultToc.alias;
  }

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

  if (!params.repo) {
    params.repo = docRepo.repo;
  }

  if (!params.branch) {
    params.branch = docRepo.default_branch || Meteor.settings.public.redoc.branch || "master";
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
