import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { createContainer } from "meteor/react-meteor-data";
import BranchSelect from "../components/branchSelect";


export default createContainer(({ repo }) => {
  const branches = {
    release: {
      name: "Release",
      branches: []
    },
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
    for (const branch of doc.branches) {
      if (Meteor.settings.public.redoc.publicBranches) {
        const isPublicBranch = _.contains(Meteor.settings.public.redoc.publicBranches, branch.name);

        if (isPublicBranch) {
          branches.default.branches.push({
            name: branch.name
          });
        } else {
          branches.preRelease.branches.push({
            name: branch.name
          });
        }
      } else {
        branches.default.branches.push({
          name: branch.name
        });
      }
    }
  }

  if (doc && doc.release) {
    for (const tag of doc.release) {
      branches.release.branches.push({
        name: tag.name,
        commit: `${tag.commit.sha}`
      });
    }
  }

  return {
    branches
  };
}, BranchSelect);
