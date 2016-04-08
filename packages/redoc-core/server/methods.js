import initRepoData from "./methods/initRepoData";
import getRepoData from "./methods/getRepoData";
import getDocSet from "./methods/getDocSet";
import getRepoToc from "./methods/getRepoToc";
import getDoc, { flushDocCache } from "./methods/getDoc";

// Meteor Methods
Meteor.methods({
  "redoc/initRepoData": initRepoData,
  "redoc/flushDocCache": flushDocCache,
  "redoc/reloadDoc": getDoc,
  "redoc/getRepoData": getRepoData,
  "redoc/getDocSet": getDocSet,
  "redoc/getRepoTOC": getRepoToc
});
