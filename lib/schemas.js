//
// Table of Contents
//
ReDoc.Schemas.TOC = new SimpleSchema({
  class: {
    type: String,
    max: 60
  },
  alias: {
    type: String
  },
  label: {
    type: String
  },
  repoUrl: {
    type: String
  },
  docPath: {
    type: String
  },
  repo: {
    type: String
  },
  createdAt: {
    type: Date,
    label: "Date",
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  }
});

ReDoc.Collections.TOC.attachSchema(ReDoc.Schemas.TOC);

//
// Doc Cache
//
ReDoc.Schemas.Docs = new SimpleSchema({
  org: {
    type: String
  },
  repo: {
    type: String
  },
  branch: {
    type: String
  },
  alias: {
    type: String
  },
  label: {
    type: String
  },
  docPageContent: {
    type: String
  },
  docPage: {
    type: String
  },
  createdAt: {
    type: Date,
    label: "Date",
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  }
});

ReDoc.Collections.Docs.attachSchema(ReDoc.Schemas.Docs);
