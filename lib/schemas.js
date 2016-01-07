//
// Github Repositories
//
ReDoc.Schemas.Repos = new SimpleSchema({
  org: {
    type: String,
    index: true
  },
  repo: {
    type: String,
    unique: true,
    index: true
  },
  label: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  apiUrl: {
    type: String,
    optional: true
  },
  rawUrl: {
    type: String,
    optional: true
  },
  docPath: {
    type: String,
    optional: true
  },
  data: {
    type: Object,
    blackbox: true,
    optional: true
  },
  release: {
    type: [Object],
    blackbox: true,
    optional: true
  }
});

ReDoc.Collections.Repos.attachSchema(ReDoc.Schemas.Repos);

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
  docPath: {
    type: String
  },
  repo: {
    type: String
  },
  default: {
    type: Boolean,
    defaultValue: false,
    optional: true
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
  docPageContentHTML: {
    type: String
  },
  docPage: {
    index: 1,
    type: String
  },
  docPath: {
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
