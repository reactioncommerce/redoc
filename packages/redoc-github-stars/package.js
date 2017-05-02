Package.describe({
  name: "reactioncommerce:redoc-github-stars",
  version: "0.0.1",
  summary: "GitHub Stars",
  documentation: "README.md"
});

Package.onUse(function (api) {
  api.use("blaze-html-templates");
  api.addFiles("head.html");
});
