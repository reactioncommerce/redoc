import React from "react";
import ReactDOM from "react-dom";
import { Router, browserHistory } from "react-router";

const ReactRouterSSR = {};

ReactRouterSSR.Run = function(routes, clientOptions) {
  if (!clientOptions) {
    clientOptions = {};
  }

  const history = clientOptions.history || browserHistory;

  Meteor.startup(function() {
    const rootElementName = clientOptions.rootElement || 'react-app';
    const rootElementType = clientOptions.rootElementType || 'div';
    const attributes = clientOptions.rootElementAttributes instanceof Array ? clientOptions.rootElementAttributes : [];
    let rootElement = document.getElementById(rootElementName);

    // In case the root element doesn't exist, let's create it
    if (!rootElement) {
      rootElement = document.createElement(rootElementType);
      rootElement.id = rootElementName;

      // check if a 2-dimensional array was passed... if not, be nice and handle it anyway
      if(attributes[0] instanceof Array) {
        // set attributes
        for(var i = 0; i < attributes.length; i++) {
          rootElement.setAttribute(attributes[i][0], attributes[i][1]);
        }
      } else if (attributes.length > 0){
        rootElement.setAttribute(attributes[0], attributes[1]);
      }

      document.body.appendChild(rootElement);
    }

    // If using redux, create the store with the initial state injected by the server.
    let reduxStore;
    if (typeof clientOptions.createReduxStore !== 'undefined') {
      InjectData.getData('redux-initial-state', data => {
        const initialState = data ? JSON.parse(data) : undefined;
        reduxStore = clientOptions.createReduxStore(initialState, history);
      });
    }

    let app = (
      <Router
        history={history}
        children={routes}
        {...clientOptions.props} />
    );

    if (clientOptions.wrapper) {
      const wrapperProps = {};
      // Pass the redux store to the wrapper, which is supposed to be some
      // flavour of react-redux's <Provider>.
      if (reduxStore) {
        wrapperProps.store = reduxStore;
      }
      app = <clientOptions.wrapper {...wrapperProps}>{app}</clientOptions.wrapper>;
    }

    ReactDOM.render(app, rootElement);

    let collectorEl = document.getElementById(clientOptions.styleCollectorId || 'css-style-collector-data')

    if (collectorEl) {
      collectorEl.parentNode.removeChild(collectorEl);
    }
  });
}

export { ReactRouterSSR };
