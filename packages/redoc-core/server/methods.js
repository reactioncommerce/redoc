/* eslint no-loop-func: 0 */

import "highlight.js";
import punycode from "punycode";
import "underscore";
import TOCParser from "../lib/plugins/toc";

export let hljs = require("highlight.js");

md = require("markdown-it")({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  },
  documentTOC(toc, env) {
    ReDoc.Collections.TOC.update({
      repo: env.repo,
      // branch: env.branch,
      alias: env.alias
    }, {
      $set: {
        documentTOC: toc
      }
    });
  },

  replaceLink: (link, env) => {
    const isImage = link.search(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i) > -1;
    const hasProtocol = link.search(/^http[s]?\:\/\//) > -1;
    let newLink = link;
    if (isImage && !hasProtocol) {
      newLink = `${env.rawUrl}/${env.branch}/${link}`;
    }
    // general link replacement for relative repo links
    if (!isImage && !hasProtocol) {
      switch (link.charAt(0)) {
      case "#":
        newLink = `/${env.repo}/${env.branch}/${env.alias}${link}`;
        break;
      case "/":
        tocItem = ReDoc.Collections.TOC.findOne({
          docPath: link.substring(1)
        });
        if (tocItem) {
          newLink = `/${tocItem.repo}/${env.branch}/${tocItem.alias}`;
        }
        break;
      default:
        newlink = link;
      }
    }
    return newLink;
  }
})
.use(require("markdown-it-replace-link"))
.use(TOCParser);

//
// Meteor Methods
//
Meteor.methods({
  /**
   *  redoc/initRepoData
   *  fetch repo and toc fixtures from private/redoc.json
   *  @returns {undefined} returns
   */
  "redoc/initRepoData": function () {
    let initRepoData;
    // if we don't have settings we'll load the redoc defaults
    if (!Meteor.settings.redoc || !Meteor.settings.redoc.initRepoData) {
      initRepoData = EJSON.parse(Assets.getText("private/redoc.json"));
    }

    // you can pass in a remote url for the initRepoData object file
    if (_.isString(Meteor.settings.redoc.initRepoData) && Meteor.settings.redoc.initRepoData.includes("http")) {
      console.log("remote initRepoData: ", Meteor.settings.redoc.initRepoData);
      // todo, callback validate, and catch this puppy
      initRepoData = EJSON.parse(HTTP.get(Meteor.settings.redoc.initRepoData).content);
    }

    // you can pass in the entire initRepoData object in settings.json
    if (!initRepoData) {
      if (Meteor.settings.redoc.initRepoData.repos) {
        initRepoData = Meteor.settings.redoc.initRepoData;
      } else {
        throw new Meteor.Error(
          "Meteor.settings.redoc.initRepoData should be an object or http url in settings.json");
      }
    }

    //
    // populate REPOS from settings
    //
    let existingRepos = ReDoc.Collections.Repos.find();
    if (existingRepos.count() === 0) {
      let Repos = initRepoData.repos;
      // if no tocData has been defined, we'll show this projects docs
      if (!Repos) {
        throw new Meteor.Error(
          "No repos have been defined in Meteor.settings.redoc.initRepoData url or object neither in private/redoc.json"
        );
      }
      // for each Repo insert new repoData
      Repos.forEach(function (repoItem) {
        ReDoc.Collections.Repos.insert(repoItem);
      });
    }
    // populate TOC from settings
    let TOC = ReDoc.Collections.TOC.find();
    if (TOC.count() === 0) {
      let tocData = initRepoData.tocData;
      // if no tocData has been defined, we'll show this projects docs
      if (!tocData) {
        throw new Meteor.Error(
          "No tocData have been defined in Meteor.settings.redoc.initRepoData url or object neither in private/redoc.json"
        );
      }
      // insert TOC fixtures
      tocData.forEach(function (tocItem, index) {
        ReDoc.Collections.TOC.insert({
          ...tocItem,
          position: index
        });
      });
    }
    // Run once will get all repo data for current repos
    Meteor.call("redoc/getRepoData");
  },
  /**
   *  redoc/flushDocCache
   *  fetch repo profile from github and store in RepoData collection
   *  @param {Boolean} option - if true we'll flush the existing repo records first
   *  @returns {undefined} returns
   */
  "redoc/flushDocCache": function () {
    ReDoc.Collections.TOC.remove({});
    ReDoc.Collections.Docs.remove({});
    return Meteor.call("redoc/initRepoData");
  },
  /**
   *  redoc/getRepoData
   *  fetch repo profile from github and store in RepoData collection
   *
   *  @param {Boolean} option - if true we'll flush the existing repo records first
   *  @returns {undefined} returns
   */
  "redoc/getRepoData": function () {
    this.unblock();
    const repos = ReDoc.Collections.Repos.find().fetch();
    // default authString
    if (authString === undefined) {
      authString = "";
    }

    // gather multiple repo gh profiles
    for (let repo of repos) {
      let repoData;
      let releaseData;
      let branchesData;
      const apiUrl = repo.apiUrl || `https://api.github.com/repos/${repo.org}/${repo.repo}`; // should we maybe clean off prefixes?
      const rawUrl = repo.rawUrl || `https://raw.githubusercontent.com/${repo.org}/${repo.repo}`;

      // get repo urls ands stats
      repoData = Meteor.http.get(apiUrl + authString, {
        headers: {
          "User-Agent": "ReDoc/1.0"
        }
      });
      // fetch repo release data
      if (repoData && repoData.data) {
        // get updated release tags
        releaseData = Meteor.http.get(repoData.data.tags_url + authString, {
          headers: {
            "User-Agent": "ReDoc/1.0"
          }
        });
        // get release data
        if (repoData && releaseData) {
          // fetch repo branches data
          branchesData = Meteor.http.get(apiUrl + "/branches" + authString, {
            headers: {
              "User-Agent": "ReDoc/1.0"
            }
          });

          if (repoData && branchesData) {
            ReDoc.Collections.Repos.upsert({
              _id: repo._id
            }, {
              $set: {
                repo: repo.repo,
                org: repo.org,
                label: repo.label || result.data.name,
                description: repo.description || repoData.data.description,
                data: repoData.data,
                apiUrl: apiUrl || repoData.data.url,
                rawUrl: rawUrl,
                release: releaseData.data,
                branches: branchesData.data,
                defaultBranch: repoData.data.default_branch
              }
            });
          }
          // populate docset
          Meteor.call("redoc/getDocSet", repo.repo);
        }
      }
    } // end loop
  },
  /**
   *  redoc/getDocSet
   *  fetch all docs for a specified repo / branch
   *  @param {String} repo - repo
   *  @param {String} fetchBranch - optional branch
   *  @returns {undefined} returns
   */
  "redoc/getDocSet": function (repo, fetchBranch) {
    check(repo, String);
    check(fetchBranch, Match.Optional(String, null));
    // get repo details
    const docRepo = ReDoc.Collections.Repos.findOne({
      repo: repo
    });

    const branch = fetchBranch || Meteor.settings.public.redoc.branch || docRepo.defaultBranch || "master";

    // we need to have a repo
    if (!docRepo) {
      console.log(`redoc/getDocSet: Failed to load repo data for ${repo}`);
      return false;
    }

    // assemble TOC
    let docTOC = ReDoc.Collections.TOC.find({
      repo: repo
    }).fetch();

    for (let tocItem of docTOC) {
      let docSourceUrl = `${docRepo.rawUrl}/${branch}/${tocItem.docPath}`;
      // lets fetch that Github repo
      Meteor.http.get(docSourceUrl, function (error, result) {
        if (error) return error;
        if (result.statusCode === 200) {
          // sensible defaults for every repo
          let docSet = ReDoc.getPathParams(docSourceUrl);
          docSet.docPage = docSourceUrl;
          docSet.docPath = tocItem.docPath;

          // if TOC has different alias, we'll use that
          if (tocItem.alias) {
            docSet.alias = tocItem.alias;
          }

          // pre-process documentation
          if (!result.content) {
            console.log(`redoc/getDocSet: Docset not found for ${docSet.docPath}.`);
            result.content = `# Not found. \n  ${docSourceUrl}`; // default not found, should replace with custom tpl.
          }

          docSet.docPageContent = result.content;
          docSet.docPageContentHTML = md.render(result.content, {
            rawUrl: docRepo.rawUrl,
            branch: branch,
            alias: tocItem.alias,
            repo: repo
          });

          // insert new documentation into Cache
          return ReDoc.Collections.Docs.upsert({
            docPage: docSourceUrl
          }, {
            $set: docSet
          });
        }
      });
    }
  }
});
