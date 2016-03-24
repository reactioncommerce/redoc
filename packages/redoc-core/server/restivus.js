/* eslint camelcase: [2, {properties: "never"}] */

import url from "url";
import s from "underscore.string";
import sha1 from "sha1";

Meteor.startup(function () {
  if (Meteor.settings.services) {
    const serviceSettings = _.find(Meteor.settings.services, (service) => {
      return service.github;
    });
    if (serviceSettings && serviceSettings.github) {
      const settings = serviceSettings.github;
      if (settings.webhook && settings.webhook.updateDocs) {
        let basename = s.rtrim(url.parse(__meteor_runtime_config__.ROOT_URL).pathname, "/");

        let Api = new Restivus({
          apiPath: basename + "/api"
        });

        Api.addRoute("updateDocs", {
          authRequired: false
        }, {
          post: function () {
            if (this.request && this.request.headers && this.request.headers["x-hub-signature"] === "sha1=" +
              sha1(JSON.stringify(this.bodyParams), settings.webhook.updateDocs).toString()) {
              Meteor.call("redoc/flushDocCache");
              return {
                success: true
              };
            }
            return {
              success: false
            };
          }
        });
      }
    }
  }
});
