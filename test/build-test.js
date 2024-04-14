import { expect } from "chai";
import sinon from "sinon";
import { handler } from "../functions/build/index.js";
import logger from "../functions/build/utils/logger.js";
import editionService from "../functions/build/services/edition.js";
import rssService from "../functions/build/services/rss.js";
import storageService from "../functions/build/services/storage.js";
import templateService from "../functions/build/services/template.js";

describe("build", function () {
  let loadDefinitionsStub;
  let writeDistFileStub;
  let fetchLatestStub;
  let syncDistFilesStub;
  let logInfoSpy;
  let logErrorSpy;

  beforeEach(function () {
    loadDefinitionsStub = sinon.stub(editionService, "loadDefinitions");
    fetchLatestStub = sinon.stub(rssService, "fetchLatest");
    writeDistFileStub = sinon.stub(storageService, "writeDistFile");
    syncDistFilesStub = sinon.stub(storageService, "syncDistFiles");
    logInfoSpy = sinon.spy(logger, "logInfo");
    logErrorSpy = sinon.spy(logger, "logError");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should build editions", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    loadDefinitionsStub.callsFake(() => {
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

    fetchLatestStub.callsFake(async (feedURL) => {
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
    expect(callbackArgs[1], "response").to.equal("Build succeeded");

    expect(loadDefinitionsStub.calledOnce).to.be.true;

    expect(fetchLatestStub.callCount).to.equal(6);

    expect(writeDistFileStub.callCount).to.be.equal(2);

    const writeDistFileArgs = writeDistFileStub.firstCall.args;

    expect(writeDistFileArgs[0], "fileName").to.equal("example1");

    expect(writeDistFileArgs[1], "html").to.include(
      '<span class="header-edition">Example 1</span>'
    );

    expect(writeDistFileArgs[1], "html").to.include(
      `<a href="http://example.com/a" class="main-news-link" target="_blank" rel="noopener noreferrer">`
    );

    expect(syncDistFilesStub.calledOnce).to.be.true;
  });

  it("should error if no editions", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    loadDefinitionsStub.callsFake(() => []);

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[0], "error").to.exist;
    expect(callbackArgs[0].message, "error").to.equal("Build failed");

    expect(logInfoSpy.callCount, "logInfo").to.equal(0);
    expect(logErrorSpy.callCount, "logError").to.equal(1);
  });

  it("should handle fetch errors", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    loadDefinitionsStub.callsFake(() => {
      return [
        {
          key: "example",
          name: "Example",
          feeds: ["https://example.com/feed"],
        },
      ];
    });

    fetchLatestStub.throws(() => {
      throw new Error("Unable to fetch latest posts");
    });

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[1], "response").to.exist;
    expect(callbackArgs[1], "response").to.equal("Build succeeded");

    expect(logInfoSpy.callCount, "logInfo").to.equal(1);
    expect(logErrorSpy.callCount, "logError").to.equal(0);
  });

  it("should handle build errors", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    loadDefinitionsStub.callsFake(() => {
      return [
        {
          key: "example",
          name: "Example",
          feeds: ["https://example.com/feed"],
        },
      ];
    });

    fetchLatestStub.callsFake(async (feedURL) => {
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

    sinon.stub(templateService, "buildTemplate").throws(() => {
      throw new Error("Build error");
    });

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[0], "error").to.exist;
    expect(callbackArgs[0].message, "error").to.equal("Build failed");

    expect(logInfoSpy.callCount, "logInfo").to.equal(0);
    expect(logErrorSpy.callCount, "logError").to.equal(1);
  });

  it("should handle sync errors", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    loadDefinitionsStub.callsFake(() => {
      return [
        {
          key: "example",
          name: "Example",
          feeds: ["https://example.com/feed"],
        },
      ];
    });

    fetchLatestStub.callsFake(async (feedURL) => {
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

    syncDistFilesStub.throws(() => {
      throw new Error("Sync error");
    });

    // when
    await handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[0], "error").to.exist;
    expect(callbackArgs[0].message, "error").to.equal("Build failed");

    expect(logInfoSpy.callCount, "logInfo").to.equal(0);
    expect(logErrorSpy.callCount, "logError").to.equal(1);
  });
});
