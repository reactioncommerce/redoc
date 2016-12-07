import getDocSet from "./methods/getDocSet";
import getDoc from "./methods/getDoc";
import { flushPrimaryDocCache } from "./methods/repoData";

// Meteor Methods
Meteor.methods({
  "redoc/flushDocCache": flushPrimaryDocCache,
  "redoc/getDocSet": getDocSet,
  "redoc/getDoc": getDoc
});
