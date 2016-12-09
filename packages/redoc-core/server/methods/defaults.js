import { Meteor } from "meteor/meteor";

/**
 *  configureDefaults
 *  fetch repo profile from github and store in RepoData collection
 *  @param {Object} options - mongo style selector for the doc
 *  @returns {undefined} returns
 */
export function configureDefaults() {
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
      schedule: "every 48 hours",
      initRepoData: {
        repos: [{
          org: "reactioncommerce",
          repo: "redoc",
          label: "Redoc",
          description: "redoc documentation"
        }],
        tocData: [{
          class: "guide-nav-item",
          alias: "intro",
          label: "Introduction",
          repo: "redoc",
          docPath: "README.md",
          default: true
        }]
      }
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
}

export default configureDefaults;
