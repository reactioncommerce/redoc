/* eslint-env mocha */

// These are Chimp globals
/* globals browser assert server */

describe("Reaction Docs Smoke Tests", function () {
  describe("Page title", function () {
    it("should be set to Reaction Docs - index @watch", function () {
      browser.url("http://localhost:3000");
      browser.waitForExist("button.redoc");
      assert.equal(browser.getTitle(), "Reaction Docs - Index", "page title is incorrect");
    });
  });
});

