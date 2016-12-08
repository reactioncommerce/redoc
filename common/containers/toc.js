import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import TOC from "../components/toc";

function fetchDoc(params) {
  let selector = {};

  selector = {
    branch: params && params.branch || "master"
  };

  return ReDoc.Collections.TOC.find(selector, {
    sort: {
      position: 1
    }
  });
}

export default createContainer(({ params }) => {
  let data = {};

  if (Meteor.isClient) {
    const tocSub = Meteor.subscribe("TOC", params);

    data = {
      tocIsLoaded: tocSub.ready(),
      docs: fetchDoc(params).fetch(),
      isMenuVisible: Session.get("isMenuVisible")
    };
  }

  if (Meteor.isServer) {
    data = {
      tocIsLoaded: true,
      docs: fetchDoc(params).fetch()
    };
  }

  return data;
}, TOC);
