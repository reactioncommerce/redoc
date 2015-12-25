// Template.header.helpers({
//   repoDetails: function () {
//     return ReDoc.Collections.Docs.findOne();
//   },
//   isCurrentBranch: function (branch, returnValueIfTrue, returnValueIfFalse) {
//     return branch === FlowRouter.getParam("branch") ? returnValueIfTrue : returnValueIfFalse;
//   },
//   branches: function () {
//     const repos = ReDoc.Collections.Repos.find().fetch();
//     const branches = ["master"];
//     // let's get all the default
//     for (let repo of repos) {
//       branches.push(repo.data.default_branch);
//     }
//     return branches;
//   }
// });
