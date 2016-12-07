import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";


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
    alias: Match.Optional(String, null),
    subdoc: Match.Optional(String, null)
  });

  // const isAdminUser = Roles.userIsInRole(Meteor.userId(), ["admin"], "redoc");
  const params = {};


  // Set params defaults
  params.repo = docParams.repo;
  params.alias = docParams.alias;
  if (docParams.subdoc) {
    params.alias = `${docParams.alias}/${docParams.subdoc}`;
  }
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

  // assemble TOC
  const docTOC = ReDoc.Collections.TOC.findOne({
    alias: params.alias,
    repo: params.repo
  });

  // find specific branch in Docs
  const cacheDoc = ReDoc.Collections.Docs.find({
    repo: params.repo,
    branch: params.branch,
    alias: params.alias
  });

  // If the doc is not cached, fetch it and then cache
  if (cacheDoc.count() === 0 && docTOC) {
    // Cache doc if it as not been cached yet
    Meteor.call("redoc/getDoc", {
      branch: params.branch,
      repo: params.repo,
      alias: params.alias
    });
  }
  // return cache doc
  return cacheDoc;
});
