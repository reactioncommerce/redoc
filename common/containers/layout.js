import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import Layout from "../components/layout";

export default createContainer(({ params }) => {
  const data = {
    isMenuVisible: false,
    user: Meteor.user()
  };

  if (Meteor.isClient) {
    Meteor.subscribe("userData");
    data.isMenuVisible = Session.equals("isMenuVisible", true);
  }

  return data;
}, Layout);
