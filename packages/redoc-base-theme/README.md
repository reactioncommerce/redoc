# ReDoc Theme
`meteor add reactioncommerce:redoc-theme`

About this package:

'reactioncommerce:redoc-theme' is the base ReDoc theme.

It contains all the LESS files used by the ReDoc documentation tool.

# Theme Development
For customization of ReDoc, you can clone this package to create additional theme packages for ReDoc.

# package.js
When creating/cloning a new theme, update the package.js `Package.describe`,

```
Package.describe({
  name: "<your meteor organization>:<your-theme-package>",
  summary: "<your theme description>",
  version: "1.0.0",
  git: "<your package repo url>"
});
```
