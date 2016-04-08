import { Meteor } from "meteor/meteor";

/**
 *  redoc/getRepoData
 *  fetch repo profile from github and store in RepoData collection
 *
 *  @param {Boolean} option - if true we'll flush the existing repo records first
 *  @returns {undefined} returns
 */
function getRepoData() {
  this.unblock();
  const repos = ReDoc.Collections.Repos.find().fetch();
  // default authString
  if (authString === undefined) {
    authString = "";
  }

  // gather multiple repo gh profiles
  for (let repo of repos) {
    let repoData;
    let releaseData;
    let branchesData;
    const apiUrl = repo.apiUrl || `https://api.github.com/repos/${repo.org}/${repo.repo}`; // should we maybe clean off prefixes?
    const rawUrl = repo.rawUrl || `https://raw.githubusercontent.com/${repo.org}/${repo.repo}`;

    // get repo urls ands stats
    repoData = Meteor.http.get(apiUrl + authString, {
      headers: {
        "User-Agent": "ReDoc/1.0"
      }
    });
    // fetch repo release data
    if (repoData && repoData.data) {
      // get updated release tags
      releaseData = Meteor.http.get(repoData.data.tags_url + authString, {
        headers: {
          "User-Agent": "ReDoc/1.0"
        }
      });
      // get release data
      if (repoData && releaseData) {
        // fetch repo branches data
        branchesData = Meteor.http.get(apiUrl + "/branches" + authString, {
          headers: {
            "User-Agent": "ReDoc/1.0"
          }
        });

        if (repoData && branchesData) {
          ReDoc.Collections.Repos.upsert({
            _id: repo._id
          }, {
            $set: {
              repo: repo.repo,
              org: repo.org,
              label: repo.label || result.data.name,
              description: repo.description || repoData.data.description,
              data: repoData.data,
              apiUrl: apiUrl || repoData.data.url,
              rawUrl: rawUrl,
              release: releaseData.data,
              branches: branchesData.data,
              defaultBranch: repoData.data.default_branch,
              contentsUrl: repoData.data.contents_url
            }
          });
        }
        // populate docset
        Meteor.call("redoc/getDocSet", repo.repo);
      }
    }
  } // end loop
}

export default getRepoData;
