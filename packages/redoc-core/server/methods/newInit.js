
let authString = "";

export function getAuth() {
  return authString;
}

function hasServices() {
  return Array.isArray(Meteor.settings.services);
}

/**
 * Step 1: Configre github API and other services
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
 * Step 2: init any admin users in configuration
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
  } else {
    // If we don't have settings we'll load the redoc defaults
    repoData = EJSON.parse(Assets.getText("private/redoc.json"));
  }

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
export function updateRepoDataFromSettings() {
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

function getTOC() {
  return ReDoc.Collections.TOC.find().fetch();
}

function getTOCFromRemoteRepo(org, repoName, branch) {
  const rawUrl = `https://raw.githubusercontent.com/${org}/${repoName}/${branch}/redoc.json`;
  // console.log(rawUrl);

  try {
    return EJSON.parse(HTTP.get(rawUrl).content);
  } catch (e) {
    console.log("No redoc.json found. Skipping...");
    return false;
  }
}

export function cleanTOC() {
  return ReDoc.Collections.TOC.remove({});
}

export function updateTOCFromSettings() {
  const TOC = ReDoc.Collections.TOC.find();
  const repos = ReDoc.Collections.Repos.find({}).fetch();

  // // Clean out old table-of-contents entries
  // cleanTOC();

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
    }
  }
}

function getDoc() {

}
