import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import TOC from "../components/toc";

function fetchDoc(params) {
  return ReDoc.Collections.TOC.find({
    $or: [
      {
        branch: params.branch || "master"
      },
      {
        commit: params.branch
      }
    ]
  }, {
    sort: {
      position: 1
    }
  });
}

export default createContainer(({ params }) => {
  let data = {};

  if (Meteor.isClient) {
    const tocSub = Meteor.subscribe("TOC");
    data = {
      tocIsLoaded: tocSub.ready(),
      docs: ReDoc.Collections.TOC.find({
        $or: [
          {
            branch: params.branch || "master"
          },
          {
            commit: params.branch
          }
        ]
      }, {
        sort: {
          position: 1
        }
      }).fetch(),
      isMenuVisible: Session.get("isMenuVisible")
    };
  }

  if (Meteor.isServer) {
    data = {
      tocIsLoaded: true,
      docs: ReDoc.Collections.TOC.find({
        $or: [
          {
            branch: params.branch || "master"
          },
          {
            commit: params.branch
          }
        ]
      }, {
        sort: {
          position: 1
        }
      }).fetch()
    };
  }

  return data;
}, TOC);
