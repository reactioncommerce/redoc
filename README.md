# redoc
**redoc** is a [Meteor](https://meteor.com) application that can be used to present styled markdown from multiple Github repositories.

**redoc** fetches content from GitHub and [renders markdown](https://github.com/markdown-it/markdown-it), caching the HTML to be managed with a Table of Contents and stylized with theme packages.

```
git clone https://github.com/reactioncommerce/redoc.git
cd redoc && npm install
meteor --settings settings.json
```

**redoc** is the application used for the [Reaction](https://reactioncommerce.com) documentation.

**redoc** is using `meteor --release 1.3-modules-beta.4`, with imported [npm](https://www.npmjs.com/) packages. It also uses [react](https://facebook.github.io/react/) and [react-router](https://github.com/rackt/react-router) to server-side render HTML content for the docs.

Since we use this project to generate docs for [Reaction Commerce](https://reactioncommerce.com/), we've included our `settings.json` and `redoc.json` that we use to generate our documentation as an example.

Example`settings.json`

```
{
  "public": {
    "ga": {
      "account": ""
    },
    "gitter": {
      "room": "reactioncommerce/redoc"
    }
  },
  "services": [{
    "github": {
      "clientId": "",
      "secret": ""
    }
  }],
  "redoc": {
    "initRepoData": "redoc.json"
  }
}
```

The environment variable `METEOR_SETTINGS` can also be used.

## Initialization
**redoc** is initialized with an array of repositories `repos`,  and a Table of Contents, `tocData` array from `private/redoc.json`

```
{
  "repos": [{
    "org": "reactioncommerce",
    "repo": "reaction-docs",
    "label": "Reaction",
    "description": "Reaction Commerce Guide"
  }],  
"tocData": [{
    "class": "guide-nav-item",
    "alias": "intro",
    "label": "Introduction",
    "repo": "reaction-docs",
    "docPath": "index.md",
    "default": true
  }, {
    "class": "guide-sub-nav-item",
    "alias": "dashboard",
    "label": "Dashboard",
    "repo": "reaction-docs",
    "docPath": "admin/dashboard.md"
  }]
}
```

You can change the `initRepoData` in the settings, to use any file in the `private` folder.

> While this works for us, in the future a UI to admin the database would be nice, as all the docs and TOC are pulled into collections. Issues, Pull Requests are welcome.

### Remote configuration
You can supply a url in `initRepoData` as well, and we'll fetch from the remote location.

```
  "redoc": {
    "initRepoData": "https://raw.githubusercontent.com/reactioncommerce/redoc/master/private/redoc.json"
  }
```

### Custom prefix
You can set doc prefix using Meteor.settings `ROOT_URL`.

```
ROOT_URL="http://localhost/docs" meteor --settings settings.json
```

## Theme
To customize the theme, copy the `packages/reaction-doc-theme` to a new package folder, and update the packages.js with your new theme package name.

## Gitter
Use `Meteor.settings.public.gitter.room` to configure the [Gitter Sidecar](https://sidecar.gitter.im/) room. To remove Gitter:

```
meteor remove reactioncommerce:redoc-gitter
```
