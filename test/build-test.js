const { expect } = require("chai");
const sinon = require("sinon");
const { handler } = require("../functions/build");
const log = require("../functions/build/services/log");
const edition = require("../functions/build/services/edition");
const fs = require("../functions/build/services/fs");
const rss = require("../functions/build/services/rss");
const s3 = require("../functions/build/services/s3");
const template = require("../functions/build/services/template");

describe("build", function () {
  let editionReadEditionsStub;
  let fsWriteDistFileStub;
  let rssFetchLatestStub;
  let s3SyncDistFilesStub;
  let logInfoSpy;

  beforeEach(function () {
    editionReadEditionsStub = sinon.stub(edition, "readEditions");
    fsWriteDistFileStub = sinon.stub(fs, "writeDistFile");
    rssFetchLatestStub = sinon.stub(rss, "fetchLatest");
    s3SyncDistFilesStub = sinon.stub(s3, "syncDistFiles");
    logInfoSpy = sinon.spy(log, "info");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should build editions", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    editionReadEditionsStub.callsFake(() => {
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

    rssFetchLatestStub.callsFake(async (feedURL) => {
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
      info: [],
      error: [],
    });

    expect(editionReadEditionsStub.calledOnce).to.be.true;

    expect(rssFetchLatestStub.callCount).to.equal(6);

    expect(fsWriteDistFileStub.callCount).to.be.equal(2);

    const writeDistFileArgs = fsWriteDistFileStub.firstCall.args;

    expect(writeDistFileArgs[0], "fileName").to.equal("example1");

    expect(writeDistFileArgs[1], "html").to.include(
      '<span class="header-edition">Example 1</span>'
    );

    expect(writeDistFileArgs[1], "html").to.include(
      `<a href="http://example.com/a" class="main-news-link" target="_blank" rel="noopener noreferrer">`
    );

    expect(s3SyncDistFilesStub.calledOnce).to.be.true;
  });

  it("should error if no editions", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    editionReadEditionsStub.callsFake(() => []);

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

  it("should handle fetch errors", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    editionReadEditionsStub.callsFake(() => {
      return [
        {
          key: "example",
          name: "Example",
          feeds: ["https://example.com/feed"],
        },
      ];
    });

    rssFetchLatestStub.throws(() => {
      throw new Error("Unable to fetch latest posts");
    });

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[1], "response").to.exist;
    expect(callbackArgs[1], "response").to.deep.equal({
      info: ["fetch(https://example.com/feed): Unable to fetch latest posts"],
      error: [],
    });
  });

  it("should handle build errors", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    editionReadEditionsStub.callsFake(() => {
      return [
        {
          key: "example",
          name: "Example",
          feeds: ["https://example.com/feed"],
        },
      ];
    });

    rssFetchLatestStub.callsFake(async (feedURL) => {
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

    sinon.stub(template, "buildTemplate").throws(() => {
      throw new Error("Build error");
    });

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[0], "error").to.exist;
    expect(callbackArgs[0].message, "error").to.equal("Build failed");
    expect(logInfoSpy.firstCall.firstArg).to.deep.equal({
      info: [],
      error: ["build(example): Build error"],
    });
  });

  it("should handle sync errors", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    editionReadEditionsStub.callsFake(() => {
      return [
        {
          key: "example",
          name: "Example",
          feeds: ["https://example.com/feed"],
        },
      ];
    });

    rssFetchLatestStub.callsFake(async (feedURL) => {
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

    s3SyncDistFilesStub.throws(() => {
      throw new Error("Sync error");
    });

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[0], "error").to.exist;
    expect(callbackArgs[0].message, "error").to.equal("Build failed");
    expect(logInfoSpy.firstCall.firstArg).to.deep.equal({
      info: [],
      error: ["sync: Sync error"],
    });
  });
});
