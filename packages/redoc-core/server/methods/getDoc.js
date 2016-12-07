import { check } from "meteor/check";
import processDoc from "./processDoc";

/**
 *  getDoc
 *  fetch repo profile from github and store in RepoData collection
 *  @param {Object} doc - mongo style selector for the doc
 *  @returns {undefined} returns
 */
function getDoc(options) {
  check(options, Object);

  // get repo details
  const docRepo = ReDoc.Collections.Repos.findOne({
    repo: options.repo
  });

  // we need to have a repo
  if (!docRepo) {
    console.log(`redoc/getDocSet: Failed to load repo data for ${options.repo}`);
    return false;
  }

  // TOC item for this doc
  const tocItem = ReDoc.Collections.TOC.findOne({
    alias: options.alias,
    repo: options.repo
  });

  processDoc({
    branch: options.branch,
    repo: options.repo,
    alias: options.alias,
    docRepo,
    tocItem
  });
}

export default getDoc;
export { flushDocCache };
