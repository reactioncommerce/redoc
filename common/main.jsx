import Layout from "../common/layout.jsx";
import Docs from "../common/docs/docs.jsx";

const {Route, IndexRoute} = ReactRouter;

const AppRoutes = (
  <Route path="/" component={Layout}>
    <Route path="/:repo/:branch/:alias" component={Docs} />
    <IndexRoute component={Docs} />
  </Route>
);

ReactRouterSSR.Run(AppRoutes);
