const { expect } = require("chai");
const sinon = require("sinon");
const { handler } = require("../functions/build");
const fs = require("../functions/build/services/fs");
const rss = require("../functions/build/services/rss");
const s3 = require("../functions/build/services/s3");

describe("build", function () {
  let requireFiles;
  let writeDistFile;
  let fetchLatest;
  let syncDistFiles;

  beforeEach(function () {
    requireFiles = sinon.stub(fs, "requireFiles");
    writeDistFile = sinon.stub(fs, "writeDistFile");
    fetchLatest = sinon.stub(rss, "fetchLatest");
    syncDistFiles = sinon.stub(s3, "syncDistFiles");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should build editions", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    requireFiles.callsFake(() => {
      return [
        {
          key: "example1",
          name: "Example 1",
          feeds: [
            "https://example.com/feed1",
            "https://example.com/feed2",
            "https://example.com/feed3",
          ],
        },
        {
          key: "example2",
          name: "Example 2",
          feeds: [
            "https://example.com/feed1",
            "https://example.com/feed2",
            "https://example.com/feed3",
          ],
        },
      ];
    });

    fetchLatest.callsFake(async (feedURL) => {
      return [
        {
          title: `Post A for ${feedURL}`,
          link: "http://example.com/a",
        },
        {
          title: `Post B for ${feedURL}`,
          link: "http://example.com/b",
        },
      ];
    });

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[1], "response").to.exist;
    expect(callbackArgs[1], "response").to.deep.equal({
      errors: [],
    });

    expect(requireFiles.calledOnce).to.be.true;

    expect(fetchLatest.callCount).to.equal(6);

    expect(writeDistFile.callCount).to.be.equal(2);

    const writeDistFileArgs = writeDistFile.firstCall.args;

    expect(writeDistFileArgs[0], "fileName").to.equal("example1");

    expect(writeDistFileArgs[1], "html").to.include(
      '<span class="header-edition">Example 1</span>'
    );

    expect(writeDistFileArgs[1], "html").to.include(
      `<a href="http://example.com/a" class="main-news-link" target="_blank" rel="noopener noreferrer">`
    );

    expect(syncDistFiles.calledOnce).to.be.true;
  });

  it("should error if no editions", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    requireFiles.callsFake(() => []);

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[0], "error").to.exist;
    expect(callbackArgs[0].message, "error").to.equal(
      "Expected editions to be defined"
    );
  });
  });
});
