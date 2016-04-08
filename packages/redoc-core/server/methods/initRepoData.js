import { Meteor } from "meteor/meteor";
import { EJSON } from "meteor/ejson";

/**
 *  initWithRepoData
 *  fetch repo and toc fixtures from private/redoc.json
 *  @returns {undefined} returns
 */
function initWithRepoData() {
  let initRepoData;
  // if we don't have settings we'll load the redoc defaults
  if (!Meteor.settings.redoc || !Meteor.settings.redoc.initRepoData) {
    initRepoData = EJSON.parse(Assets.getText("private/redoc.json"));
  }

  // you can pass in a remote url for the initRepoData object file
  if (_.isString(Meteor.settings.redoc.initRepoData) && Meteor.settings.redoc.initRepoData.includes("http")) {
    console.log("remote initRepoData: ", Meteor.settings.redoc.initRepoData);
    // todo, callback validate, and catch this puppy
    initRepoData = EJSON.parse(HTTP.get(Meteor.settings.redoc.initRepoData).content);
  }

  // you can pass in the entire initRepoData object in settings.json
  if (!initRepoData) {
    if (Meteor.settings.redoc.initRepoData.repos) {
      initRepoData = Meteor.settings.redoc.initRepoData;
    } else {
      throw new Meteor.Error("Meteor.settings.redoc.initRepoData should be an object or http url in settings.json");
    }
  }

  // populate REPOS from settings
  const existingRepos = ReDoc.Collections.Repos.find();

  if (existingRepos.count() === 0) {
    let Repos = initRepoData.repos;
    // if no tocData has been defined, we'll show this projects docs
    if (!Repos) {
      throw new Meteor.Error("No repos have been defined in Meteor.settings.redoc.initRepoData url or object neither in private/redoc.json");
    }
    // for each Repo insert new repoData
    Repos.forEach(function (repoItem) {
      ReDoc.Collections.Repos.insert(repoItem);
    });
  }

  // populate TOC from settings
  const TOC = ReDoc.Collections.TOC.find();
  const defaultRepo = ReDoc.Collections.Repos.findOne({default: true}) || {};

  if (TOC.count() === 0 && initRepoData.tocData) {
    // insert TOC fixtures
    initRepoData.tocData.forEach(function (tocItem, index) {
      const filename = tocItem.docPath.split("/").pop().replace(/\.[^/.]+$/, "");

      ReDoc.Collections.TOC.insert({
        class: "guide-sub-nav-item",
        alias: filename,
        repo: defaultRepo.repo,
        ...tocItem,
        position: index
      });
    });
  }

  // Run once will get all repo data for current repos
  Meteor.call("redoc/getRepoData");

  // If TOC is still empty, get TOC from Repository
  if (ReDoc.Collections.TOC.find().count() === 0) {
    ReDoc.Collections.Repos.find().forEach(function(repo) {
      Meteor.call("redoc/getRepoTOC", repo.repo, Meteor.settings.public.redoc.branch || docRepo.defaultBranch);
    })
  }
}

export default initWithRepoData;
