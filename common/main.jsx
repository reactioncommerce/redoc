import React from "react";
import { Route, IndexRoute, useRouterHistory } from "react-router";
import Layout from "../common/layout.jsx";
import Docs from "../common/docs/containers/docs";
import { ReactRouterSSR } from "meteor/reactrouter:react-router-ssr";
import { default as ReactCookie } from "react-cookie";
import { RedocAdmin } from "meteor/reactioncommerce:redoc-core/components/admin.jsx";
import { createHistory } from "history";

const analytics = analytics || null;

const AppRoutes = (
  <Route component={Layout} path="/">
    <Route component={Docs} path="/:repo/:branch/:alias" />
    <Route component={Docs} path="/:repo/:branch/:alias/:subdoc" />
    <Route component={RedocAdmin} path="/redoc" />
    <IndexRoute component={Docs} />
  </Route>
);

let clientOptions = {
  props: {
    onUpdate() {
      if (analytics) {
        // Segment.com pageview
        // TODO: figure out the best way to make this wait for the
        // page title and location details to be ready
        if (analytics.page) {
          analytics.page({
            path: window.location.pathname,
            url: window.location.href,
            title: Meteor.settings.public.redoc.title
          });
        }
      }
    }
  }
};

function getBasename() {
  let el = document.createElement("a");
  el.href = __meteor_runtime_config__.ROOT_URL; // eslint-disable-line camelcase
  if (el.pathname.substr(-1) !== "/") {
    return el.pathname + "/";
  }
  return el.pathname;
}

if (Meteor.isClient) {
  let history = useRouterHistory(createHistory)({
    basename: getBasename()
  });

  // At the /base/hello/world URL:
  history.listen(function (location) {
    if (location.basename !== getBasename()) {
      location.pathname = "/";
      location.basename = getBasename();
    }
  });

  clientOptions.history = history;
}

ReactRouterSSR.Run(AppRoutes, clientOptions, {
  preRender: (req, res) => {
    ReactCookie.plugToRequest(req, res);
  }
});
