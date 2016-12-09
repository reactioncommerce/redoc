import {
  configureDefaults,
  initServiceConfiguration,
  initAdminUsers,
  updateRepoData,
  updateTOC,
  reloadTOCCache,
  reloadRepoCache,
  reloadPrimaryDocCache,
  cachePrimaryDocs
} from "./methods/repoData";

// set defaults to redoc data
configureDefaults();

/*
 * scheduled processes so that we don"t don"t endless hit
 * external endpoints
 */
SyncedCron.add({
  name: "Update Repo Cache",
  schedule: function (parser) {
    const schedule = Meteor.settings.redoc.schedule || "every 5 days";
    return parser.text(schedule);
  },
  job: function () {
    reloadRepoCache();
    reloadTOCCache();
  }
});

SyncedCron.add({
  name: "Flush Docs Cache",
  schedule: function (parser) {
    const schedule = Meteor.settings.redoc.schedule || "every 24 hours";
    return parser.text(schedule);
  },
  job: function () {
    reloadPrimaryDocCache();
  }
});

SyncedCron.start();


Meteor.startup(function () {
  // Init service condifurations
  initServiceConfiguration();

  // Set up admin users
  initAdminUsers();

  // Init repo data
  updateRepoData();

  // Init TOC
  updateTOC();

  // Cache primary docs if they are not already cached (publicBranches in settings)
  cachePrimaryDocs();
});
