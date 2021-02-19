const { expect } = require("chai");
const sinon = require("sinon");
const { handler } = require("../functions/build");
const fs = require("../functions/build/services/fs");
const rss = require("../functions/build/services/rss");
const template = require("../functions/build/services/template");
const post = require("../functions/build/services/post");
const s3 = require("../functions/build/services/s3");

describe("build", function () {
  afterEach(function () {
    sinon.restore();
  });

  it("should build editions", function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    const requireFiles = sinon.spy(fs, "requireFiles");

    const fetchLatest = sinon
      .stub(rss, "fetchLatest")
      .callsFake(async (feedURL) => {
        return {
          title: "Example feed",
          items: [
            {
              title: "Post A",
              link: "http://example.com/a",
            },
            {
              title: "Post B",
              link: "http://example.com/b",
            },
          ],
        };
      });

    const buildTemplate = sinon.spy(template, "buildTemplate");

    const filterPosts = sinon.spy(post, "filterPosts");

    const createTempFile = sinon.spy(fs, "createTempFile");

    const syncTempFiles = sinon.spy(s3, "syncTempFiles");

    // when
    handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const expectedError = null;
    const expectedResponse = {
      errors: [],
    };

    expect(callback.firstCall.args).to.deep.equal([
      expectedError,
      expectedResponse,
    ]);

    expect(requireFiles.calledOnce).to.be.true;

    expect(fetchLatest.callCount).to.equal(4);

    expect(buildTemplate.calledOnce).to.be.true;

    expect(filterPosts.calledOnce).to.be.true;

    expect(createTempFile.calledOnce).to.be.true;

    expect(syncTempFiles.calledOnce).to.be.true;
  });
});
