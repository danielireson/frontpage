const { expect } = require("chai");
const sinon = require("sinon");
const { handler } = require("../functions/build");
const fs = require("../functions/build/services/fs");
const rss = require("../functions/build/services/rss");
const s3 = require("../functions/build/services/s3");

describe("build", function () {
  afterEach(function () {
    sinon.restore();
  });

  it("should build editions", async function () {
    // given
    const event = {};
    const context = {};
    const callback = sinon.spy();

    const requireFiles = sinon.spy(fs, "requireFiles");

    const fetchLatest = sinon
      .stub(rss, "fetchLatest")
      .callsFake(async (feedURL) => {
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

    const createTempFile = sinon.stub(fs, "createTempFile");

    const syncTempFiles = sinon.stub(s3, "syncTempFiles");

    // when
    await handler(event, context, callback);

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

    expect(requireFiles.firstCall.returnValue).to.deep.include({
      key: "united-kingdom",
      name: "United Kingdom",
      feeds: [
        "https://example.co.uk/1",
        "https://example.co.uk/2",
        "https://example.co.uk/3",
        "https://example.co.uk/4",
      ],
    });

    expect(fetchLatest.callCount).to.equal(4);

    expect(createTempFile.callCount).to.be.equal(1);

    const createTempFileArgs = createTempFile.firstCall.args;

    expect(createTempFileArgs[0]).to.equal("united-kingdom");

    expect(createTempFileArgs[1]).to.include(
      '<span class="header-edition">United Kingdom</span>'
    );

    expect(createTempFileArgs[1]).to.include(
      '<a href="http://example.com/a" class="main-news-link">'
    );

    expect(syncTempFiles.calledOnce).to.be.true;
  });
});
