Package.describe({
  name: 'reactrouter:react-router-ssr',
  version: '4.0.0',
  summary: 'Server-side rendering for react-router and react-meteor-data rehydratating Meteor subscriptions',
  git: 'https://github.com/thereactivestack/meteor-react-router-ssr.git',
  documentation: 'README.md'
});

Npm.depends({
  'cookie-parser': '1.4.3',
  'cheerio': '0.20.0',
  'deepmerge': '0.2.10'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  api.use([
    'ecmascript@0.4.7',
    'tracker@1.0.14',
    'minimongo@1.0.17',
    'meteorhacks:fast-render@2.14.0',
    'meteorhacks:inject-data@2.0.0',
    'tmeasday:check-npm-versions@0.3.1'
  ]);

  api.use([
    'underscore@1.0.9',
    'webapp@1.2.10',
    'mongo@1.1.9_1',
    'routepolicy@1.0.11',
    'url@1.0.10'
  ], 'server');

  api.use([
    'autopublish@1.0.7',
    'tmeasday:publish-counts@0.7.3',
    'promise@0.7.3'
  ], 'server', {weak: true})

  api.export('ReactRouterSSR');
  api.mainModule('lib/react-router-ssr.js');
});
