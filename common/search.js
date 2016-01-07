


if (Meteor.isClient) {
  Meteor.subscribe("search")
  Meteor.subscribe("TOC")
  Meteor.subscribe("Repos")

  var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
  };
  var fields = ["docPageContent"];

  DocSearch = new SearchSource('docs', fields, options);
}



if (Meteor.isServer) {
  SearchSource.defineSource("docs", function(searchText, options) {
    var options = {sort: {isoScore: -1}, limit: 20};

    if(searchText) {
      var regExp = buildRegExp(searchText);
      var selector = {docPageContent: regExp};
      return ReDoc.Collections.Docs.find(selector, options).fetch();
    } else {
      return ReDoc.Collections.Docs.find({}, options).fetch();
    }
  });

  function buildRegExp(searchText) {
    var words = searchText.trim().split(/[ \-\:]+/);
    var exps = _.map(words, function(word) {
      return "(?=.*" + word + ")";
    });
    var fullExp = exps.join('') + ".+";
    return new RegExp(fullExp, "i");
  }
}
