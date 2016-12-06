import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { createContainer } from "meteor/react-meteor-data";
import BranchSelect from "../components/branchSelect";


export default createContainer(({ repo }) => {
  const branches = {
    default: {
      name: "Default",
      branches: []
    },
    preRelease: {
      name: "Pre-Release",
      branches: []
    }
  };
  const doc = ReDoc.Collections.Repos.findOne({ repo }) || ReDoc.Collections.Repos.findOne();

  if (doc && doc.branches) {
    const isAdminUser = Roles.userIsInRole(Meteor.userId(), ["admin"], "redoc");

    for (branch of doc.branches) {
      if (Meteor.settings.public.redoc.publicBranches) {
        const isPublicBranch = _.contains(Meteor.settings.public.redoc.publicBranches, branch.name);

        if (isPublicBranch) {
          branches.default.branches.push(branch.name);
        } else {
          branches.preRelease.branches.push(branch.name);
        }
      } else {
        branches.default.branches.push(branch.name);
      }
    }
  }

  return { branches };
}, BranchSelect);
