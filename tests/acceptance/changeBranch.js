/* eslint-env mocha */
/* globals browser assert server */

describe("Change branches", function () {
  describe("When changing branches before selecting a section", function () {
    it("should show the appropriate intro section from that branch @watch", function () {
      browser.url("http://localhost:3000");
      browser.waitForExist("select#branch-select");
      browser.click("select#branch-select");
      browser.selectByValue("select#branch-select", "development");
      let branchUrl = browser.getUrl();
      assert.equal(branchUrl.indexOf("undefined"), 0, "URL contains `undefined`");
    });
  });
});
