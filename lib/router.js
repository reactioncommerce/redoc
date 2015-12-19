FlowRouter.route("/:branch?/:alias?", {
  action: function () {
    BlazeLayout.render("layout");
  },
  name: "Documentation"
});
