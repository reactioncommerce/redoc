Server-side rendering for react-router and react-meteor-data rehydratating Meteor subscriptions

It has a protection against leaking your data. Only subscribed data will be available just the way it would be on the client.

What about your SEO? Just add [`nfl:react-helmet`](https://atmospherejs.com/nfl/react-helmet) package and it will take care of adding your page title / meta tags on server-rendering.

## Install
`meteor add reactrouter:react-router-ssr`

## Usage
### `ReactRouterSSR.Run(routes, [clientOptions], [serverOptions])`
The `routes` argument takes the routes you want react-router to use (you don't have to call `ReactDOM.render()` yourself)<br />
Read the [react-router documentation](https://github.com/rackt/react-router/tree/master/docs) for more informations.

#### routes
Your main `<Route />` node of your application.<br />
**Notice that their is no `<Router />` element, ReactRouterSSR takes care of creating it on the client and server with the correct parameters**

#### clientOptions (optional)
- `rootElement` [string]: The root element ID your React application is mounted with (defaults to `react-app`)
- `rootElementType` [string]: Set the root element type (defaults to `div`)
- `rootElementAttributes`[array]: Set the root element attributes as an array of tag-value pairs. I.e. `[['class', sidebar main], ['style', 'background-color: white']]`
- `props` [object]: The additional arguments you would like to give to the `<Router />` component on the client.
- `history`: History object to use. You can use `new ReactRouter.history.createHistory()`, `new ReactRouter.history.createHashHistory()` or `new ReactRouter.history.createMemoryHistory()`
- `wrapper` [React component]: Wrapping your whole application client-side
- `createReduxStore` [callback]: (if using Redux) A callback returning the application's redux store. See example below.

#### serverOptions (optional)
- `props` [object]: The additional arguments you would like to give to the `<Router />` component on the server.
- `preRender` [function(req, res)]: Executed just before the renderToString
- `postRender` [function(req, res)]: Executed just after the renderToString
- `dontMoveScripts` [bool]: Keep the script inside the head tag instead of moving it at the end of the body
- `wrapper` [React component]: Wrapping your whole application server-side
- `createReduxStore` [callback]: (if using Redux) A callback returning the application's redux store. See example below.

### Scripts
Unless you disabled it, the scripts yo have in the header will be moved down at the end of the body tag.

To keep a particuliar code in the head, you can add the `data-dont-move` attribute like this:

```html
<script data-dont-move>/* I'll stay in the head tag! */</script>
```

## Simple Example
```javascript
const {IndexRoute, Route} = ReactRouter;

AppRoutes = (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="login" component={LoginPage} />
    <Route path="*" component={NotFoundPage} />
    {/* ... */}
  </Route>
);

HomePage = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    Meteor.subscribe('profile');

    return {
      profile: Profile.findOne({ user: Meteor.userId() })
    };
  },

  render() {
    return <div>Hi {profile.name}</div>;
  }
});

ReactRouterSSR.Run(AppRoutes);
```

## Complex Example
```javascript
const {IndexRoute, Route} = ReactRouter;

AppRoutes = (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="login" component={LoginPage} />
    <Route path="*" component={NotFoundPage} />
    {/* ... */}
  </Route>
);

ReactRouterSSR.Run(AppRoutes, {
  props: {
    onUpdate() {
      // Notify the page has been changed to Google Analytics
      ga('send', 'pageview');
    }
  }
}, {
  preRender: function(req, res) {
    ReactCookie.plugToRequest(req, res);
  }
});

if (Meteor.isClient) {
  // Load Google Analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-XXXXXXXX-X', 'auto');
  ga('send', 'pageview');
}
```

## Example with Redux

ReactRouterSSR supports applications that use Redux, using the `createReduxStore` and `wrapper` options in both clientOptions and serverOptions.
- `createReduxStore` should be a callback in the shape `(initialState, history) => store`
- `wrapper` should be the `Provider` component from react-redux (or some custom component wrapping the `Provider` and passing it the `store` prop it receives)

On both server and client side, ReactRouterSSR.Run() takes care of calling the `createReduxStore` callback and passing the resulting store as a prop to the `wrapper` component.

```javascript
import { createStore } from 'redux';
import { Provider } from 'react-redux'
import reducers from './myAppReducers';

const {IndexRoute, Route} = ReactRouter;

AppRoutes = (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="login" component={LoginPage} />
    <Route path="*" component={NotFoundPage} />
    {/* ... */}
  </Route>
);

// Simplest example:
const createReduxStore = (initialState) => createStore(reducers, initialState);

// More advanced: the 'history' param is useful when using the react-router-redux
// package (e.g. to be able to trigger route transistions using redux actions)
import { applyMiddleware } from 'redux';
import { syncHistory } from 'react-router-redux';
const createReduxStore = (initialState, history) => {
  // Create the react-router-redux middleware with the received 'history' object
  // (on the server side, ReactRouterSSR.Run() automatically passes a memoryHistory,
  // compatible with server execution)
  const reduxRouterMiddleware = syncHistory(history);
  const createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware)(createStore);
  // Create the store.
  return createStoreWithMiddleware(reducers, initialState);
}

Meteor.startup(() => {
  const clientOptions = {
    wrapper: Provider,
    createReduxStore
  };
  // Use the same 'wrapper' and 'createReduxStore' in serverOptions, or adjust to your needs.
  const serverOptions = clientOptions;

  ReactRouterSSR.Run(routes, clientOptions, serverOptions);
});
```

### Client-side store rehydration
ReactRouterSSR automatically takes care of client-side store rehydration:

- On server side, once rendering is done, the resulting store state is serialized (using `JSON.stringify()`) and sent to the client as part of the generated HTML.
- On the client side, that serialized state is automatically picked up and passed to the `createReduxStore` callback as the 'initialState'.

#### State serialization
The `JSON.stringify()` serialization means that, if your reducers store "rich" domain objects with methods attached though prototypes or ES6 classes (for example documents fetched from Mongo collections with an associated transform, or [ImmutableJS](https://facebook.github.io/immutable-js) structures...), the client receives them downcasted to Plain Old Javascript Objects (without prototypes or methods) in the 'initialState'.

It is then the responsibility of the client code to "upcast" them back to the expected domain objects. It is recommended to handle that in each of the relevant reducers, by taking advantage of the fact that redux's `createStore()` dispatches an internal action with the 'initialState' it has been passed (which, in our case, is the unserialized state coming from the server rendering.)

For example:

- for a reducer that stores a document read from a collection that has a transform attached :
```js
function myReducer(state = {}, action) {
  // If needed, upcast the raw state passed by the server SSR.
  if (typeof state.expectedHelper === 'undefined') { // Or some other check for MyDomainClass ?
    state = transform(state); // Where transform is the same transform you assigned to your collection
  }
  // Then the usual action matching :
  switch (action.type) {
    ... return state;
  }
}
```
- for a reducer that stores ImmutableJS structures, [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs)'s createReducer() helper accepts an optional 'constructor' argument that does exactly that (defaults to `Immutable.fromJS()`).

### Server-side pre-render data fetching (optional)
On the server-side, ReactRouterSSR implements the "fetchData" mechanism mentioned at the bottom of [the Redux doc on Server-Side Rendering](http://rackt.org/redux/docs/recipes/ServerRendering.html):

The route components (e.g. `App`, `HomePage`, `LoginPage`... in the example above) can optionally specify a static fetchData() method to pre-populate the store with external data before rendering happens.
That fetchData() method, if present, will be automatically called for the components of the matched route (e.g. on `App` and `HomePage` for the url `'/'` in the example above).

The fetchData() method receives:

- the store's `getState` function,
- the store's `dispatch` function,
- the routing props for the resolved route (notably including `location` and `params`)

and can dispatch async actions for external data fetching, returning the corresponding Promise. Rendering is then deferred until all Promises are resolved.
