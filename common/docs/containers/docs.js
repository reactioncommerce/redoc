import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import Docs from "../components/docs.jsx";


export default createContainer(({ params }) => {
  const sub = Meteor.subscribe("CacheDocs", params);

  if (Meteor.isClient) {
    const search = DocSearch.getData({
      transform: (matchText, regExp) => {
        return matchText.replace(regExp, "<span class='highlight'>$&</span>");
      }
    });

    return {
      docIsLoaded: sub.ready(),
      currentDoc: ReDoc.Collections.Docs.findOne(params),
      search: search
    };
  }

  if (Meteor.isServer) {
    return {
      docIsLoaded: true,
      currentDoc: ReDoc.Collections.Docs.findOne(params),
      search: []
    };
  }
}, Docs);
