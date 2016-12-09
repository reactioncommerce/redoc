Package.describe({
  summary: "Reactive Data Source for Search",
  version: "1.4.2",
  git: "https://github.com/meteorhacks/search-source.git",
  name: "meteorhacks:search-source"
});

Package.onUse(function (api) {
  configurePackage(api);
  api.export(["SearchSource"]);
});

Package.onTest(function (api) {
  configurePackage(api);

  api.use(["tinytest", "mongo-livedata"], ["client", "server"]);
});

function configurePackage(api) {
  api.versionsFrom("METEOR@1.3.1");

  api.use([
    "ecmascript",
    "modules",
    "tracker",
    "underscore",
    "mongo",
    "reactive-var",
    "http",
    "ejson",
    "check",
    "ddp",
    "meteorhacks:picker"
  ]);

  api.add_files([
    "lib/server.js"
  ], ["server"]);

  api.add_files([
    "lib/client.js"
  ], ["client"]);
}
