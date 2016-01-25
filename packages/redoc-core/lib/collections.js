/*
* Define app globals
*/

ReDoc = {};
ReDoc.Subscriptions = {};
ReDoc.Collections = {};
ReDoc.Schemas = {};

/*
 *  Define Meteor Mongo Collections
 */
// Github repository(ies) that we pull docs and data from
// includes releases and repo data
ReDoc.Collections.Repos = new Mongo.Collection("Repos");

// Table of Contents for Markdown Docs found in Repos
ReDoc.Collections.TOC = new Mongo.Collection("TOC");

// DOCS caching for Markdown Docs found in TOC
ReDoc.Collections.Docs = new Mongo.Collection("Docs");
