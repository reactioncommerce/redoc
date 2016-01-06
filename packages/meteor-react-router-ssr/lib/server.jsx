// meteor algorithm to check if this is a meteor serving http request or not
function IsAppUrl(req) {
  var url = req.url
  if(url === '/favicon.ico' || url === '/robots.txt') {
    return false;
  }

  // NOTE: app.manifest is not a web standard like favicon.ico and
  // robots.txt. It is a file name we have chosen to use for HTML5
  // appcache URLs. It is included here to prevent using an appcache
  // then removing it from poisoning an app permanently. Eventually,
  // once we have server side routing, this won't be needed as
  // unknown URLs with return a 404 automatically.
  if(url === '/app.manifest') {
    return false;
  }

  // Avoid serving app HTML for declared routes such as /sockjs/.
  if(RoutePolicy.classify(url)) {
    return false;
  }
  return true;
}

const { RoutingContext } = ReactRouter;
const url = Npm.require('url');
const Fiber = Npm.require('fibers');
const cookieParser = Npm.require('cookie-parser');

let webpackStats;

ReactRouterSSR.LoadWebpackStats = function(stats) {
  webpackStats = stats;
}

ReactRouterSSR.Run = function(routes, clientOptions, serverOptions) {
  if (!clientOptions) {
    clientOptions = {};
  }

  if (!serverOptions) {
    serverOptions = {};
  }

  if (!serverOptions.webpackStats) {
    serverOptions.webpackStats = webpackStats;
  }

  Meteor.bindEnvironment(function() {
    // Parse cookies for the login token
    WebApp.rawConnectHandlers.use(cookieParser());

    WebApp.connectHandlers.use(Meteor.bindEnvironment(function(req, res, next) {
      if (!IsAppUrl(req)) {
        next();
        return;
      }

      global.__CHUNK_COLLECTOR__ = [];

      var loginToken = req.cookies['meteor_login_token'];
      var headers = req.headers;
      var context = new FastRender._Context(loginToken, { headers });

      const originalUserId = Meteor.userId;
      const originalUser = Meteor.user;

      // This should be the state of the client when he remount the app
      Meteor.userId = () => context.userId;
      Meteor.user = () => undefined;

      // On the server, no route should be async (I guess we trust the app)
      ReactRouter.match({ routes, location: req.url }, Meteor.bindEnvironment((err, redirectLocation, renderProps) => {
        if (err) {
          res.writeHead(500);
          res.write(err.messages);
          res.end();
        } else if (redirectLocation) {
          res.writeHead(302, { Location: redirectLocation.pathname + redirectLocation.search })
          res.end();
        } else if (renderProps) {
          sendSSRHtml(clientOptions, serverOptions, context, req, res, next, renderProps);
        } else {
          res.writeHead(404);
          res.write('Not found');
          res.end();
        }
      }));

      Meteor.userId = originalUserId;
      Meteor.user = originalUser;
    }));
  })();
};

function sendSSRHtml(clientOptions, serverOptions, context, req, res, next, renderProps) {
  const { css, html, head } = generateSSRData(serverOptions, context, req, res, renderProps);
  res.write = patchResWrite(clientOptions, serverOptions, res.write, css, html, head);

  next();
}

function patchResWrite(clientOptions, serverOptions, originalWrite, css, html, head) {
  return function(data) {
    if(typeof data === 'string' && data.indexOf('<!DOCTYPE html>') === 0) {
      if (!serverOptions.dontMoveScripts) {
        data = moveScripts(data);
      }

      if (css) {
        data = data.replace('</head>', '<style id="' + (clientOptions.styleCollectorId || 'css-style-collector-data') + '">' + css + '</style></head>');
      }

      if (head) {
        // Add react-helmet stuff in the header (yay SEO!)
        data = data.replace('<head>',
          '<head>' + head.title + head.base + head.meta + head.link + head.script
        );
      }

      /*
       To set multiple root element attributes such as class and style tags, simply pass it a 2-dimensional array
       of attribute value pairs. I.e. [["class", "sidebar main"], ["style", "background-color: white"]]
       */
      let rootElementAttributes = '';
      const attributes = clientOptions.rootElementAttributes instanceof Array ? clientOptions.rootElementAttributes : [];
      // check if a 2-dimensional array was passed... if not, be nice and handle it anyway
      if(attributes[0] instanceof Array) {
        // set as concatenated string attributes
        for(var i = 0; i < attributes.length; i++) {
          rootElementAttributes = rootElementAttributes + ' ' + attributes[i][0] + '="' + attributes[i][1] + '"';
        }
      } else if (attributes.length > 0){
        rootElementAttributes = attributes[0] + '="' + attributes[1] + '"';
      }

      data = data.replace('<body>', '<body><' + (clientOptions.rootElementType || 'div') + ' id="' + (clientOptions.rootElement || 'react-app') + '" ' + rootElementAttributes + ' >' + html + '</' + (clientOptions.rootElementType || 'div') + '>');

      if (typeof serverOptions.webpackStats !== 'undefined') {
        data = addAssetsChunks(serverOptions, data);
      }
    }

    originalWrite.call(this, data);
  }
}

function addAssetsChunks(serverOptions, data) {
  const chunkNames = serverOptions.webpackStats.assetsByChunkName;
  const publicPath = serverOptions.webpackStats.publicPath;

  if (typeof chunkNames.common !== 'undefined') {
    var chunkSrc = (typeof chunkNames.common === 'string')?
      chunkNames.common :
      chunkNames.common[0];

    data = data.replace('<head>', '<head><script type="text/javascript" src="' + publicPath + chunkSrc + '"></script>');
  }

  for (var i = 0; i < global.__CHUNK_COLLECTOR__.length; ++i) {
    if (typeof chunkNames[global.__CHUNK_COLLECTOR__[i]] !== 'undefined') {
      var chunkSrc = (typeof chunkNames[global.__CHUNK_COLLECTOR__[i]] === 'string')?
        chunkNames[global.__CHUNK_COLLECTOR__[i]] :
        chunkNames[global.__CHUNK_COLLECTOR__[i]][0];

      data = data.replace('</head>', '<script type="text/javascript" src="' + publicPath + chunkSrc + '"></script></head>');
    }
  }

  return data;
}

function generateSSRData(serverOptions, context, req, res, renderProps) {
  let html, css, head;

  try {
    FastRender.frContext.withValue(context, function() {
      const originalSubscribe = Meteor.subscribe;
      Meteor.subscribe = SSRSubscribe(context);

      if (Package.mongo && !Package.autopublish) {
        Mongo.Collection._isSSR = true;
        Mongo.Collection._ssrData = {};
      }

      if (serverOptions.preRender) {
        serverOptions.preRender(req, res);
      }

      global.__STYLE_COLLECTOR_MODULES__ = [];
      global.__STYLE_COLLECTOR__ = '';

      renderProps = {
        ...renderProps,
        ...serverOptions.props
      };

      // If using redux, create the store.
      let reduxStore;
      if (typeof serverOptions.createReduxStore !== 'undefined') {
        // Create a history and set the current path, in case the callback wants
        // to bind it to the store using redux-simple-router's syncReduxAndRouter().
        const history = ReactRouter.history.useQueries(ReactRouter.history.createMemoryHistory)();
        history.replace(req.url);
        // Create the store, with no initial state.
        reduxStore = serverOptions.createReduxStore(undefined, history);
        // Fetch components data.
        fetchComponentData(renderProps, reduxStore);
      }

      // Wrap the <RoutingContext> if needed before rendering it.
      let app = <RoutingContext {...renderProps} />;
      if (serverOptions.wrapper) {
        const wrapperProps = {};
        // Pass the redux store to the wrapper, which is supposed to be some
        // flavour of react-redux's <Provider>.
        if (reduxStore) {
          wrapperProps.store = reduxStore;
        }
        app = <serverOptions.wrapper {...wrapperProps}>{app}</serverOptions.wrapper>;
      }

      // Do the rendering.
      html = ReactDOMServer.renderToString(app);

      // If using redux, pass the resulting redux state to the client so that it
      // can hydrate from there.
      if (reduxStore) {
        // inject-data accepts raw objects and calls EJSON.stringify() on them,
        // but the _.each() done in there does not play nice if the store contains
        // ImmutableJS data. To avoid that, we serialize ourselves.
        res.pushData('redux-initial-state', JSON.stringify(reduxStore.getState()));
      }

      if (Package['nfl:react-helmet']) {
        head = ReactHelmet.rewind();
      }

      css = global.__STYLE_COLLECTOR__;

      if (serverOptions.postRender) {
        serverOptions.postRender(req, res);
      }

      if (Package.mongo && !Package.autopublish) {
        Mongo.Collection._isSSR = false;
      }

      Meteor.subscribe = originalSubscribe;
    });

    res.pushData('fast-render-data', context.getData());
  } catch(err) {
    console.error('error while server-rendering', err.stack);
  }

  return { html, css, head };
}

function fetchComponentData(renderProps, reduxStore) {
  const componentsWithFetch = renderProps.components
    // Weed out 'undefined' routes.
    .filter(component => !!component)
    // Only look at components with a static fetchData() method
    .filter(component => component.fetchData);

  if (!componentsWithFetch.length) {
    return;
  }

  if (!Package.promise) {
    console.error("react-router-ssr: Support for fetchData() static methods on route components requires the 'promise' package.");
    return;
  }

  // Call the fetchData() methods, which lets the component dispatch possibly
  // asynchronous actions, and collect the promises.
  const promises = componentsWithFetch
    .map(component => component.fetchData(reduxStore.getState, reduxStore.dispatch, renderProps));

  // Wait until all promises have been resolved.
  Promise.awaitAll(promises);
}

function SSRSubscribe(context) {
  return function(name, ...params) {
    if (Package.mongo && !Package.autopublish) {
      Mongo.Collection._isSSR = false;
    }

    // Even with autopublish, this is needed to load data in fast-render
    const data = context.subscribe(name, ...params);

    if (Package.mongo && !Package.autopublish) {
      Mongo.Collection._fakePublish(data);
      Mongo.Collection._isSSR = true;
    }

    return {
      stop() {}, // Nothing to stop on server-rendering
      ready() { return true; } // server gets the data straight away
    };
  }
}

// Thank you FlowRouter for this wonderful idea :)
// https://github.com/kadirahq/flow-router/blob/ssr/server/route.js
const Cheerio = Npm.require('cheerio');

function moveScripts(data) {
  const $ = Cheerio.load(data, {
    decodeEntities: false
  });
  const heads = $('head script');
  $('body').append(heads);

  // Remove empty lines caused by removing scripts
  $('head').html($('head').html().replace(/(^[ \t]*\n)/gm, ''));

  return $.html();
}

if (Package.mongo && !Package.autopublish) {
  // Protect against returning data that has not been published
  const originalFind = Mongo.Collection.prototype.find;
  const originalFindOne = Mongo.Collection.prototype.findOne;

  Mongo.Collection.prototype._getSSRCollection = function() {
    return Mongo.Collection._ssrData[this._name] || new LocalCollection(this._name);
  };

  Mongo.Collection.prototype.findOne = function(...args) {
    if (!Mongo.Collection._isSSR) {
      return originalFindOne.apply(this, args);
    }

    return this._getSSRCollection().findOne(...args);
  };

  Mongo.Collection.prototype.find = function(...args) {
    if (!Mongo.Collection._isSSR) {
      return originalFind.apply(this, args);
    }

    return this._getSSRCollection().find(...args);
  };

  Mongo.Collection._fakePublish = function(data) {
    // Create a local collection and only add the published data
    for (let name in data) {
      if (!Mongo.Collection._ssrData[name]) {
        Mongo.Collection._ssrData[name] = new LocalCollection(name);
      }

      for (let i = 0; i < data[name].length; ++i) {
        data[name][i].forEach(doc => {
          Mongo.Collection._ssrData[name].update({ _id: doc._id }, doc, { upsert: true });
        });
      }
    }
  };

  // Support SSR for publish-counts
  if (Package['tmeasday:publish-counts']) {
    // Counts doesn't exist if we don't wait for startup (weird)
    Meteor.startup(function() {
      Counts.get = function(name) {
        const collection = Mongo.Collection._ssrData.counts || new LocalCollection('counts');
        const count = collection.findOne(name);

        return count && count.count || 0;
      };

      Counts.has = function(name) {
        const collection = Mongo.Collection._ssrData.counts || new LocalCollection('counts');
        return !!collection.findOne(name);
      }
    });
  }
}
