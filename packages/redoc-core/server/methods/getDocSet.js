import { Meteor } from "meteor/meteor";
import processDoc from "./processDoc";

/**
 *  redoc/getDocSet
 *  fetch all docs for a specified repo / branch
 *  @param {String} repo - repo
 *  @param {String} fetchBranch - optional branch
 *  @returns {undefined} returns
 */
function getDocSet(repo, fetchBranch) {
  check(repo, String);
  check(fetchBranch, Match.Optional(String, null));
  // get repo details
  const docRepo = ReDoc.Collections.Repos.findOne({
    repo: repo
  });

  const branch = fetchBranch || Meteor.settings.public.redoc.branch || docRepo.defaultBranch || "master";

  // we need to have a repo
  if (!docRepo) {
    console.log(`redoc/getDocSet: Failed to load repo data for ${repo}`);
    return false;
  }

  // assemble TOC
  let docTOC = ReDoc.Collections.TOC.find({
    repo: repo
  }).fetch();

  for (let tocItem of docTOC) {
    processDoc({
      repo,
      branch,
      docRepo,
      tocItem
    });
  }
}

export default getDocSet;
