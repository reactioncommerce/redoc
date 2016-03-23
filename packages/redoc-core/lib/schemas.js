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
  },
  branches: {
    type: [Object],
    blackbox: true,
    optional: true
  },
  defaultBranch: {
    type: String,
    optional: true
  },
  contentsUrl: {
    type: String,
    optional: true
  }
});

ReDoc.Collections.Repos.attachSchema(ReDoc.Schemas.Repos);

ReDoc.Schemas.DocumentTOC = new SimpleSchema({
  className: {
    type: String
  },
  label: {
    type: String
  },
  slug: {
    type: String
  }
});

//
// Table of Contents
//
ReDoc.Schemas.TOC = new SimpleSchema({
  class: {
    type: String,
    max: 60,
    optional: true
  },
  position: {
    type: Number,
    optional: true
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
  parentPath: {
    type: String,
    optional: true
  },
  documentTOC: {
    type: [ReDoc.Schemas.DocumentTOC],
    optional: true
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
    index: "text",
    type: String
  },
  docPageContentHTML: {
    type: String
  },
  docPage: {
    type: String
  },
  docPath: {
    type: String
  },
  docParsed: {
    type: [Object],
    blackbox: true,
    optional: true
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
