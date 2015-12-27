Template.tools.helpers({
  repoDetails: function () {
    let doc = ReDoc.Collections.Docs.findOne(); // limited by subscription to current params
    // https://github.com/reactioncommerce/reaction-docs/blob/development/developer/shipping.md
    if (doc) {
      doc.editPage = `https://github.com/${doc.org}/${doc.repo}/blob/${doc.branch}/${doc.docPath}`;
    }
    return doc;
  },
  isCurrentBranch: function (branch, returnValueIfTrue, returnValueIfFalse) {
    return branch === FlowRouter.getParam("branch") ? returnValueIfTrue : returnValueIfFalse;
  },
  branches: function () {
    const repos = ReDoc.Collections.Repos.find().fetch();
    const branches = [];
    // let's get all the default
    for (let repo of repos) {
      if (repo.data && repo.data.default_branch) {
        if (_.findWhere(branches, repo.data.default_branch) == null) {
          branches.push(repo.data.default_branch);
        }
      }
    }
    return branches;
  }
});

Template.tools.events({
  "change #tool-branch-select": function (event) {
    let branch = $(event.currentTarget).val();
    FlowRouter.setParams({
      branch: branch
    });
  }
});
