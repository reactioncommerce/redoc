import React from "react";
import { Route, IndexRoute } from "react-router";
import Layout from "../common/layout.jsx";
import Docs from "../common/docs/docs.jsx";
import { ReactRouterSSR } from "meteor/reactrouter:react-router-ssr";
import { default as ReactCookie } from "react-cookie";
import { RedocAdmin } from "meteor/reactioncommerce:redoc-core/components/admin.jsx";
import s from 'underscore.string';
import url from 'url';

const analytics = analytics || null;

const baseURL = s.rtrim(url.parse(__meteor_runtime_config__.ROOT_URL).pathname, '/') || '';
const AppRoutes = (
  <Route component={Layout} path="/">
    <Route component={RedocAdmin} path="/redoc" />
    <Route component={Docs} path={baseURL} />
    <Route component={Docs} path="/:alias" />
    <Route component={Docs} path={`${baseURL}/:alias`} />
    <Route component={Docs} path="/:branch/:alias" />
    <Route component={Docs} path={`${baseURL}/:branch/:alias`} />
    <Route component={Docs} path="/:repo/:branch/:alias" />
    <Route component={Docs} path={`${baseURL}/:repo/:branch/:alias`} />
    <IndexRoute component={Docs} />
  </Route>
);

ReactRouterSSR.Run(AppRoutes, {
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
}, {
  preRender: (req, res) => {
    ReactCookie.plugToRequest(req, res);
  }
});
