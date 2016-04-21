Package.describe({
  name: "reactrouter:react-router-ssr",
  version: "2.0.4",
  summary: "Server-side rendering for react-router and react-meteor-data rehydratating Meteor subscriptions",
  git: "https://github.com/thereactivestack/meteor-react-router-ssr.git",
  documentation: "README.md"
});

Package.onUse(function (api) {

  api.use([
    "minimongo",
    "modules",
    "mongo",
    "react-meteor-data",
    "routepolicy",
    "underscore",
    "webapp",
    "jsx",
    "meteorhacks:fast-render",
    "meteorhacks:inject-data"
  ]);

  api.mainModule("lib/client.jsx", "client");
  api.mainModule("lib/server.jsx", "server");
  api.export("ReactRouterSSR");
});
