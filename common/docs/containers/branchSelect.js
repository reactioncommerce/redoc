import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { createContainer } from "meteor/react-meteor-data";
import BranchSelect from "../components/branchSelect.jsx";


export default createContainer(({ repo }) => {
  let branches = [];
  let doc = ReDoc.Collections.Repos.findOne({ repo }) || ReDoc.Collections.Repos.findOne();

  if (doc && doc.branches) {
    const isAdminUser = Roles.userIsInRole(Meteor.userId(), ["admin"], "redoc");

    for (branch of doc.branches) {
      if (Meteor.settings.public.redoc.publicBranches) {
        const isPublicBranch = _.contains(Meteor.settings.public.redoc.publicBranches, branch.name);

        if (isPublicBranch || isAdminUser) {
          branches.push(branch.name);
        }
      } else {
        branches.push(branch.name);
      }
    }
  }

  return {
    branches: branches
  };
}, BranchSelect);
