Package.describe({
  name: "reactrouter:react-router-ssr",
  version: "2.0.4",
  summary: "Server-side rendering for react-router and react-meteor-data rehydratating Meteor subscriptions",
  git: "https://github.com/thereactivestack/meteor-react-router-ssr.git",
  documentation: "README.md"
});

Npm.depends({
  "cookie-parser": "1.3.5",
  "cheerio": "0.19.0",
  "react-router": "2.0.1",
  "history": "2.0.0",
  "react-helmet": "2.3.1",
  "react-cookie": "0.4.3"
});

Package.onUse(function (api) {
  api.use("modules");

  api.use([
    "jsx@0.2.3",
    "minimongo@1.0.0",
    "react-meteor-data@0.2.4",
    "meteorhacks:fast-render@2.12.0",
    "meteorhacks:inject-data@2.0.0"
  ]);

  api.use("webapp@1.2.0", "server");
  api.use("underscore@1.0.3", "server");
  api.use("mongo@1.0.0", "server");
  api.use("autopublish@1.0.0", "server", {weak: true});

  api.use("promise@0.5.1", "server", {weak: true});

  api.use("tmeasday:publish-counts@0.7.0", "server", {weak: true});

  api.use(["routepolicy@1.0.5"], ["server"]);

  api.mainModule("lib/client.jsx", "client");
  api.mainModule("lib/server.jsx", "server");
  api.export("ReactRouterSSR");
});
