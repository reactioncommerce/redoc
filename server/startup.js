/*
 * scheduled processes so that we don"t don"t endless hit
 * external endpoints
 */

SyncedCron.add({
  name: "Update Github Stargazers",
  schedule: function (parser) {
    return parser.text("every 2 hours");
  },
  job: function () {
    return Meteor.call("redoc/getRepoData");
  }
});

SyncedCron.add({
  name: "Update Docs Every 3 Days",
  schedule: function (parser) {
    return parser.text("every 3 days");
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
  }
  // Initialize Repo data
  Meteor.call("redoc/initRepoData");
});
