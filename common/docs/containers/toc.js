import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import TOC from "../components/toc.jsx";


export default createContainer(({ params }) => {
  let data = {};
  const tocSub = Meteor.subscribe("TOC");

  if (Meteor.isClient) {
    data = {
      tocIsLoaded: tocSub.ready(),
      docs: ReDoc.Collections.TOC.find({}, {
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
      docs: ReDoc.Collections.TOC.find({}, {
        sort: {
          position: 1
        }
      }).fetch()
    };
  }

  return data;
}, TOC);
