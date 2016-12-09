import _ from "underscore";
export { configureDefaults } from "./defaults";

let authString = "";

export function getAuth() {
  return authString;
}

function hasServices() {
  return Array.isArray(Meteor.settings.services);
}

export function getPublicBranches() {
  return Meteor.settings.public.redoc.publicBranches || ["master"];
}

/**
 * Configre github API and other services
 * @return {[type]} [description]
 */
export function initServiceConfiguration() {
  // Import settinngs typically found in a Meteor settings file
  // settings file location <app-root>/settings/settings.json
  // or meteor --settings=path/to/settings.json
  if (hasServices()) {
    // Loop through the array of service objects
    for (const serviceObject of Meteor.settings.services) {
      for (const service in serviceObject) {
        // Validate that the properties we're trying to access, actually belong
        // to the service, and not a prototype
        if ({}.hasOwnProperty.call(serviceObject, service)) {
          const settings = serviceObject[service];

          // Add the setting to the service configuration collection
          ServiceConfiguration.configurations.upsert({
            service
          }, {
            $set: settings
          });

          // If we have github credentials we'll also create an auth param string for api requests
          if (service === "github") {
            authString = `?client_id=${settings.clientId}&client_secret=${settings.secret}`;
          }
        }
      }
    }
  }
}

/**
 * Init any admin users in configuration
 * @return {[type]} [description]
 */
export function initAdminUsers() {
  if (hasServices()) {
    if (Meteor.settings.redoc && Meteor.settings.redoc.users) {
      for (const user of Meteor.settings.redoc.users) {
        const userData = Meteor.users.findOne({
          "services.github.username": user.username
        });

        if (userData) {
          Roles.addUsersToRoles(userData._id, user.roles, "redoc");
        }
      }
    }
  }
}

/**
 * Get repoData
 * @return {[type]} [description]
 */
function getRepoData() {
  let repoData;

  if (Meteor.settings.redoc && Meteor.settings.redoc.initRepoData) {
    // If the `initRepoData` key is a string, then fetch the repo data from that URL
    if (_.isString(Meteor.settings.redoc.initRepoData) && Meteor.settings.redoc.initRepoData.includes("http")) {
      repoData = EJSON.parse(HTTP.get(Meteor.settings.redoc.initRepoData).content);
    } else if (typeof Meteor.settings.redoc.initRepoData === "object") {
      // you can pass in the entire initRepoData object in settings.json
      repoData = Meteor.settings.redoc.initRepoData;
    } else {
      throw new Meteor.Error("Meteor.settings.redoc.initRepoData should be an object or http url in settings.json");
    }
  }
  if (!repoData) throw new Meteor.Error("RepoData not found. Check Meteor.settings.redoc.initRepoData");
  return repoData;
}

/**
 * hasExistingRepoData
 * @return {Boolean} returns true if there is existing repodata in the database
 */
function hasExistingRepoData() {
  return ReDoc.Collections.Repos.find().count() > 0;
}

/**
 * Updates repos settings from loaded configuration
 * @return {[type]} [description]
 */
export function updateRepoData() {
  if (hasExistingRepoData() === false) {
    const repoData = getRepoData();

    if (Array.isArray(repoData.repos)) {
      for (const repo of repoData.repos) {
        let remoteRepoData;
        let releaseData;
        let branchesData;
        const apiUrl = repo.apiUrl || `https://api.github.com/repos/${repo.org}/${repo.repo}`; // should we maybe clean off prefixes?
        const rawUrl = repo.rawUrl || `https://raw.githubusercontent.com/${repo.org}/${repo.repo}`;

        // get repo urls ands stats
        remoteRepoData = Meteor.http.get(apiUrl + authString, {
          headers: {
            "User-Agent": "ReDoc/1.0"
          }
        });

        // If repo data exists, then fetch release data as well
        if (remoteRepoData && remoteRepoData.data) {
          // Get updated release tags
          try {
            releaseData = Meteor.http.get(remoteRepoData.data.tags_url + authString, {
              headers: {
                "User-Agent": "ReDoc/1.0"
              }
            });
          } catch (error) {
            console.log("Error fetching", remoteRepoData.data.tags_url);
          }
        }

        // If we have both release and remote repo data, then also fetch the branch data
        if (remoteRepoData && releaseData) {
          branchesData = Meteor.http.get(apiUrl + "/branches" + authString, {
            headers: {
              "User-Agent": "ReDoc/1.0"
            }
          });
        }

        // With the repo and branch data, insert into database
        if (repoData && branchesData) {
          ReDoc.Collections.Repos.upsert({
            _id: repo._id
          }, {
            $set: {
              repo: repo.repo,
              org: repo.org,
              label: repo.label || result.data.name,
              description: repo.description || remoteRepoData.data.description,
              data: remoteRepoData.data,
              apiUrl: apiUrl || remoteRepoData.data.url,
              rawUrl: rawUrl,
              release: releaseData.data,
              branches: branchesData.data,
              defaultBranch: remoteRepoData.data.default_branch,
              contentsUrl: remoteRepoData.data.contents_url
            }
          });
        }
      }
    } else {
      throw new Meteor.Error("No repos have been defined in Meteor.settings.redoc.initRepoData url or object neither in private/redoc.json");
    }
  }
}

function getTOCFromRemoteRepo(org, repoName, branch) {
  const rawUrl = `https://raw.githubusercontent.com/${org}/${repoName}/${branch}/redoc.json`;

  try {
    return EJSON.parse(HTTP.get(rawUrl).content);
  } catch (e) {
    return Meteor.settings.redoc.initRepoData;
    // return false;
  }
}

export function getTOC() {
  return ReDoc.Collections.TOC.find().fetch();
}

export function cleanTOC() {
  return ReDoc.Collections.TOC.remove({});
}

export function updateTOC() {
  const TOC = ReDoc.Collections.TOC.find();
  const repos = ReDoc.Collections.Repos.find({}).fetch();

  if (TOC.count() > 0) {
    return;
  }

  // Loop through all available repos
  if (Array.isArray(repos)) {
    for (const repo of repos) {
      // Loop through all branches of all available repos
      for (const branch of repo.branches) {
        // Request TOC (redoc.json) from the root of that repo/branch
        const toc = getTOCFromRemoteRepo(repo.org, repo.repo, branch.name);

        // If we have a toc then process each entry
        if (toc) {
          if (Array.isArray(toc.tocData)) {
            // Loop through all entries and add them to the TOC collection
            toc.tocData.forEach((tocItem, index) => {
              const filename = tocItem.docPath.split("/").pop().replace(/\.[^/.]+$/, "");

              ReDoc.Collections.TOC.insert({
                class: "guide-sub-nav-item",
                alias: filename,
                repo: repo.repo,
                branch: branch.name,
                ...tocItem,
                position: index
              });
            });
          }
        }
      }

      if (repo.release) {
        for (const release of repo.release) {
          const toc = getTOCFromRemoteRepo(repo.org, repo.repo, release.commit.sha);

          if (toc) {
            if (Array.isArray(toc.tocData)) {
              // Loop through all entries and add them to the TOC collection
              toc.tocData.forEach((tocItem, index) => {
                const filename = tocItem.docPath.split("/").pop().replace(/\.[^/.]+$/, "");

                ReDoc.Collections.TOC.insert({
                  class: "guide-sub-nav-item",
                  alias: filename,
                  repo: repo.repo,
                  branch: release.name,
                  type: "release",
                  commit: release.commit.sha,
                  ...tocItem,
                  position: index
                });
              });
            }
          }
        }
      }
      //
    }
  }
}

/**
 * Clear and reload the repo data
 * @return {void} no return value
 */
export function reloadRepoCache() {
  ReDoc.Collections.repos.remove({});
  updateRepoData();
}

/**
 * Clear and reload the TOC data
 * @return {void} no return value
 */
export function reloadTOCCache() {
  ReDoc.Collections.TOC.remove({});
  updateTOC();
}


/**
 *  redoc/flushPrimaryDocCache
 *  Flush all docs that are not related to a release
 *
 *  This will ensure that docs from release tags / branches are not deleted as they most likely
 *  will not need to be udpated as they will not change.
 *
 *  @param {Boolean} option - if true we'll flush the existing repo records first
 *  @returns {undefined} returns
 */
export function flushPrimaryDocCache() {
  ReDoc.Collections.Docs.remove({
    type: {
      $ne: "release"
    }
  });
}

export function reloadPrimaryDocCache() {
  flushPrimaryDocCache();
  cachePrimaryDocs();
}

export function cachePrimaryDocs() {
  // Update repo data and TOC if they are empty;
  updateRepoData();
  updateTOC();

  const repos = ReDoc.Collections.Repos.find({}).fetch();

  // Loop through all available repos
  if (Array.isArray(repos)) {
    for (const repo of repos) {
      // Cache branch branches that meet the criteria
      if (Array.isArray(repo.branches)) {
        for (const branch of repo.branches) {
          if (_.contains(getPublicBranches(), branch.name)) {
            const docCount = ReDoc.Collections.Docs.find({
              repo: repo.repo,
              branch: branch.name
            }).count();

            if (docCount === 0) {
              Meteor.call("redoc/getDocSet", repo.repo, branch.name);
            }
          }
        }
      }
    }
  }
}
