Package.describe({
  name: "reactioncommerce:redoc-core",
  version: "0.0.2",
  summary: "redoc - markdown rendered into collections",
  documentation: "README.md"
});

// not using meteor Npm.depends, use package.json in app root and `npm install`

Package.onUse(function (api) {
  api.use("blaze-html-templates");
  api.use("ecmascript");
  api.use("aldeed:collection2");
  api.use("aldeed:simple-schema");
  api.use("percolate:synced-cron");
  api.use("mongo");
  api.use("alanning:roles");
  api.use("url");

  // common
  api.addFiles("lib/collections.js");
  api.addFiles("lib/router.js");
  api.addFiles("lib/schemas.js");

  // server
  api.addFiles("server/methods.js", "server");
  api.addFiles("server/publications.js", "server");
  api.addFiles("server/restivus.js", "server");
  api.addFiles("server/startup.js", "server");
  // client
  api.addFiles("client/subscriptions.js", "client");

  api.addFiles("components/admin.jsx", ["client", "server"], {isImport: true});

  api.export("ReDoc");
  api.export("RedocAdmin");
});
