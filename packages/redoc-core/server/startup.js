import {
  initServiceConfiguration,
  initAdminUsers,
  updateRepoData,
  updateTOC,
  reloadTOCCache,
  reloadRepoCache,
  reloadPrimaryDocCache
} from "./methods/repoData";

/*
 * scheduled processes so that we don"t don"t endless hit
 * external endpoints
 */
SyncedCron.add({
  name: "Update Repo Cache",
  schedule: function (parser) {
    const schedule = Meteor.settings.redoc.schedule || "every 1 days";
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
    const schedule = Meteor.settings.redoc.schedule || "every 4 hours";
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

  //
  reloadPrimaryDocCache();
});
