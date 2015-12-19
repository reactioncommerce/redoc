/*
* Define app globals
*/

ReDoc = {};
ReDoc.Subscriptions = {};
ReDoc.Collections = {};


/*
 *  Define Meteor Mongo Collections
 */
// Github repository(ies) that we pull docs and data from
ReDoc.Collections.Repos = new Mongo.Collection("Repos");

// Full Github Repo Data for each repository in REPOS
ReDoc.Collections.RepoData = new Mongo.Collection("RepoData");


// Table of Contents for Markdown Docs found in Repos
ReDoc.Collections.TOC = new Mongo.Collection("TOC");

// DOCS caching for Markdown Docs found in TOC
ReDoc.Collections.Docs = new Mongo.Collection("Docs");

// Tags found
ReDoc.Collections.Tags = new Mongo.Collection("Tags");
