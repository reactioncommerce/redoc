import s from "underscore.string";
import url from "url";

Meteor.startup(function () {
  // default public settings
  if (Meteor.settings.public.redoc === undefined) {
    Meteor.settings.public.redoc = {
      title: "Reaction Docs",
      meta: {
        title: "Redoc",
        description: "Redoc",
        url: "https://github.com/reactioncommerce/redoc",
        image: "",
        favicon: "/favicon.png"
      },
      mainNavigationLinks: [{
        href: "https://github.com/reactioncommerce/redoc",
        value: "Redoc Repo"
      }, {
        href: "https://docs.reactioncommerce.com",
        value: "Reaction Docs"
      }],
      logo: {
        image: "/images/logo.png",
        link: {
          href: "https://reactioncommerce.com",
          value: "Reaction"
        }
      },
      branch: "master"
    };
  }

  // default server settings
  if (Meteor.settings.redoc === undefined) {
    Meteor.settings.redoc = {
      schedule: "every 4 hours",
      initRepoData: "https://raw.githubusercontent.com/reactioncommerce/redoc/master/private/redoc.json"
    };
  }

  // default GA settings
  if (Meteor.settings.public.ga === undefined) {
    Meteor.settings.public.ga = {
      account: ""
    };
  }

  // default Gitter room
  if (Meteor.settings.gitter === undefined) {
    Meteor.settings.gitter = {
      room: "reactioncommerce/redoc"
    };
  }

  global.baseURL = s.rtrim(url.parse(__meteor_runtime_config__.ROOT_URL).pathname, '/');
});
