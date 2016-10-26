Package.describe({
  name: "reactioncommerce:redoc-gitter",
  version: "0.0.1",
  summary: "Gitter wrapper",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.use("blaze-html-templates");
  api.addFiles("head.html");
});
