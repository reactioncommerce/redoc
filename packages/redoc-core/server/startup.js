/*
 * scheduled processes so that we don"t don"t endless hit
 * external endpoints
 */

SyncedCron.add({
  name: "Update Repo Cache",
  schedule: function (parser) {
    let schedule = Meteor.settings.redoc.schedule || "every 1 days";
    return parser.text(schedule);
  },
  job: function () {
    return Meteor.call("redoc/getRepoData");
  }
});

SyncedCron.add({
  name: "Flush Docs Cache",
  schedule: function (parser) {
    let schedule = Meteor.settings.redoc.schedule || "every 4 hours";
    return parser.text(schedule);
  },
  job: function () {
    ReDoc.Collections.Docs.remove({});
  }
});

SyncedCron.start();

Meteor.startup(function () {
  // Import settings
  if (Meteor.settings.services) {
    for (services of Meteor.settings.services) {
      for (service in services) {
        // this is just a sanity check required by linter
        if ({}.hasOwnProperty.call(services, service)) {
          // actual settings for the service
          settings = services[service];
          ServiceConfiguration.configurations.upsert({
            service: service
          }, {
            $set: settings
          });
          // if we have github credentials we'll also created
          // some an auth param string for api requests
          if (service === "github") {
            authString = `?client_id=${settings.clientId}&client_secret=${settings.secret}`;
          }
          console.log("service configuration loaded: " + service);
        }
      }
    }

    if (Meteor.settings.redoc && Meteor.settings.redoc.users) {
      for (let user of Meteor.settings.redoc.users) {
        const userData = Meteor.users.findOne({
          "services.github.username": user.username
        });

        if (userData) {
          Roles.addUsersToRoles(userData._id, user.roles, "redoc");
        }
      }

    }

  }
  // Initialize Repo data
  Meteor.call("redoc/initRepoData");
});
