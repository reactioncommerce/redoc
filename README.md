# redoc
**redoc** is a [Meteor](https://meteor.com) application that can be used to present styled markdown from multiple Github repositories. The cached content can be managed with a Table of Contents and stylized with theme packages.

```
git clone https://github.com/reactioncommerce/redoc.git
cd redoc && npm install
meteor --settings settings.json
```

`redoc` is the application used for the [Reaction](https://reactioncommerce.com) documentation.

Since we use this project to generate docs for Reaction Commerce, we've included our settings.json that we use to generate our documentation as an example.

Example`settings.json`

```
{
  "public": {
    "ga": {
      "account": ""
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

`redoc` accepts a Repos and a Table of Contents array from `private/redoc.json`

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

> While this works for us, in the future a UI to admin the database would be nice, as all the docs and TOC are pulled into collections. Issues, Pull Requests are welcome.

To customize the theme, copy the `packages/reaction-doc-theme` to a new package folder, and update the packages.js with your new theme package name.

## Custom prefix
You can set doc prefix using Meteor.settings `ROOT_URL`.

```
ROOT_URL="http://localhost/docs" meteor --settings settings.json
```
