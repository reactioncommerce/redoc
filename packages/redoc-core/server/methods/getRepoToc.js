import { Meteor } from "meteor/meteor";

/**
 *  redoc/getRepoTOC
 *  fetch all docs for a specified repo / branch starting at path
 *  @param {String} repo - repo
 *  @param {String} fetchBranch - optional branch
 *  @param {String} path - optional path
 *  @returns {undefined} returns
 **/
function getRepoToc(repo, fetchBranch, path) {
  this.unblock();
  check(repo, String);
  check(fetchBranch,  Match.Optional(String, null));
  check(path,  Match.Optional(String, null));

  // get repo details
  const docRepo = ReDoc.Collections.Repos.findOne({
    repo: repo
  });

  // we need to have a repo
  if (!docRepo) {
    console.log(`redoc/getRepoTOC: Failed to load repo data for ${repo}`);
    return false;
  }

  let branch;
  if (fetchBranch) {
    branch = fetchBranch;
  } else if (docRepo.branches && docRepo.branches.length > 0) {
    for (const branches of docRepo.branches) {
      Meteor.call("redoc/getRepoTOC", repo, branches.name, path);
    }
  } else {
    branch = docRepo.defaultBranch || "master";
  }

  if (branch) {
    // assemble TOC
    const requestUrl = docRepo.contentsUrl.replace("{+path}", path ? encodeURIComponent(path) : "") + authString + "&ref=" + branch;
    const contentData = Meteor.http.get(requestUrl, {
      headers: {
        "User-Agent": "ReDoc/1.0"
      }
    });

    if (contentData && contentData.data) {
      for (const sortIndex in contentData.data) {
        const tocItem = contentData.data[sortIndex];

        if (tocItem.type === "file" && tocItem.path !== "README.md" && (tocItem.name.indexOf(".md") === -1 || tocItem.name === "README.md")) {
          continue;
        }

        let matches, sort;
        if (matches = tocItem.name.match(/^(\d+)/)) {
          sort = s.toNumber(matches[1]);
        } else {
          sort = parseInt(sortIndex);
        }
        const tocData = {
          alias: s.slugify(s.strLeftBack(tocItem.path, ".md").replace(/^(\d+)[ \.]+/, "")),
          label: s.strLeftBack(tocItem.name, ".md").replace(/^(\d+)[ \.]+/, ""),
          repo: repo,
          branch: branch,
          position: sort,
          docPath: encodeURIComponent(tocItem.path)
        };
        // First README.md, on root
        if (tocItem.path === "README.md") {
          tocData.alias = "welcome";
          tocData.label = "Welcome";
          tocData.position = 0;
          tocData.default = true;
        }
        if (path) {
          tocData.parentPath = encodeURIComponent(path);
        }
        if (tocItem.type === "dir") {
          tocData.docPath += "/README.md";
        }
        ReDoc.Collections.TOC.insert(tocData);
        if (tocItem.type === "dir") {
          Meteor.call("redoc/getRepoTOC", repo, branch, tocItem.path);
        }
      }
    }
  }
  Meteor.call("redoc/getRepoData");
}

export default getRepoToc;
