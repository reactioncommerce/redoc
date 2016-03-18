/* eslint-env mocha */

// These are Chimp globals
/* globals browser assert server */

describe("Reaction Docs Smoke Tests", function() {
  describe("Page title", function () {
    it("should be set to Reaction Docs - index", function () {
      browser.url("http://localhost:3000");
      assert.equal(browser.getTitle(), " Reaction Docs - Index", "page title is incorrect");
    });
  });
});

