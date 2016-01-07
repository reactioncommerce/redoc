

if (Meteor.isClient) {
  Meteor.subscribe("search");
  Meteor.subscribe("TOC");
  Meteor.subscribe("Repos");

  const options = {
    keepHistory: 1000 * 60 * 5,
    localSearch: true
  };

  const fields = ["docPageContentHTML"];

  DocSearch = new SearchSource("docs", fields, options);
}


if (Meteor.isServer) {
  SearchSource.defineSource("docs", (searchText) => {
    const options = {sort: {isoScore: -1}, limit: 20};

    if (searchText) {
      const regExp = buildRegExp(searchText);
      const selector = {docPageContentHTML: regExp};

      return ReDoc.Collections.Docs.find(selector, options).fetch();
    }

    return ReDoc.Collections.Docs.find({}, options).fetch();
  });
}

function buildRegExp(searchText) {
  const words = searchText.trim().split(/[ \-\:]+/);
  const exps = _.map(words, (word) => {
    return "(?=.*" + word + ")";
  });
  const fullExp = exps.join("") + ".+";

  return new RegExp(fullExp, "i");
}
