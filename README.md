# ReDoc
ReDoc accepts a Table of Contents array from Meteor.settings.

```
"tocData": [{
  "class": "guide-nav-item",
  "alias": "intro",
  "label": "Introduction",
  "repoUrl": "https://raw.githubusercontent.com/reactioncommerce/reaction",
  "docPath": "docs/index.md"
}]
```

Starting to doc server:

```
meteor --settings settings.json
```

Since we use this project to generate docs for Reaction Commerce, we've included our settings.json that we use to generate our documentation as an example.

To make your own docs, simply provide your own `settings` json file.

> While this works for us, in the future a UI to admin the database would be nice, as all the docs and TOC are pulled into collections.

To customize the theme, copy the `packages/reaction-doc-theme` to a new package folder, and update the packages.js with your new theme package name.

## Custom prefix
You can set doc prefix using Meteor.settings `ROOT_URL`.

```
ROOT_URL="http://localhost/docs" meteor --settings settings.json
```
