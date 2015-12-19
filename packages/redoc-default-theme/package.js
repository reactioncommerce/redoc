Package.describe({
  name: "reactioncommerce:redoc-default-theme",
  summary: "ReDoc - Documentation Default theme",
  version: "1.0.0"
});

Package.onUse(function (api) {
  // Works with meteor 1.2 and above
  api.versionsFrom("METEOR@1.2");

  // Using less only for this theme
  api.use("less");
  api.use("blaze-html-templates");

  // Include core theme to get its base styles
  api.use("reactioncommerce:redoc-base-theme");

  // Add top level .less files
  api.addFiles([
    "header/header.html",
    "main.less"
  ], "client");
});
