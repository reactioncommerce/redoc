AdminConfig = {
  collections: {
    "ReDoc.Collections.Repos": {}
  }
};

/**
 * ReDoc.getPathParams
 * @param  {String} docPagee github markdown document's url
 * @return {Object} returns params object for Flow Router
 */

ReDoc.getPathParams = function (docPage) {
  let params = {};
  // Example: https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md
  //         ---0--1-----2------------3-------------4------5-----6-----7------8---------9----XXX
  // sensible defaults for every repo
  params.alias = docPage.substring(docPage.lastIndexOf("/") + 1).split(".").slice(0, -1).join(".").toLowerCase();
  params.label = params.alias.charAt(0).toUpperCase() + params.alias.slice(1);
  params.org = docPage.split("/").slice(3, 4).join("/");
  params.repo = docPage.split("/").slice(4, 5).join("/");
  params.branch = docPage.split("/").slice(5, 6).join("/");
  return params;
};

//
//  Flow Router Definition
//
FlowRouter.route("/:repo?/:branch?/:alias?", {
  action: function () {
    BlazeLayout.render("layout");
  },
  subscriptions: function (params) {
    this.register("CacheDocs", Meteor.subscribe("CacheDocs", params));
  },
  name: "Documentation"
});
