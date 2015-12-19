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
Meteor.publish("CacheDocs", function (docPage) {
  // some minor validation
  check(docPage, Match.Optional(String, null));

  let docPageContent = ReDoc.Collections.Docs.find({
    docPage: docPage
  });

  if (docPageContent.count() === 0 && docPage) {
    Meteor.call("util/getGHDoc", docPage);
  }

  return docPageContent;
});

/*
 *  RepoData gets all the repo data reactioncommerce/reaction
 *  pulls new data if there is none
 */

Meteor.publish("RepoData", function () {
  let repoData = ReDoc.Collections.RepoData.find({}, {
    sort: {
      createdAt: 1
    }
  });
  if (repoData.count() === 0) {
    Meteor.call("util/getRepoData");
  }
  return repoData;
});

Meteor.publish("Tags", function () {
  return ReDoc.Collections.Tags.find({}, {
    sort: {
      releasedAt: -1
    }
  });
});
