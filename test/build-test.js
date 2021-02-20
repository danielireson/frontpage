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

    const writeDistFile = sinon.stub(fs, "writeDistFile");

    const syncDistFiles = sinon.stub(s3, "syncDistFiles");

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

    const expectedUnitedKingdomEdition = {
      key: "united-kingdom",
      name: "United Kingdom",
      feeds: ["https://feeds.bbci.co.uk/news/rss.xml"],
    };

    expect(requireFiles.firstCall.returnValue).to.deep.include(
      expectedUnitedKingdomEdition
    );

    expect(fetchLatest.callCount).to.equal(
      expectedUnitedKingdomEdition.feeds.length
    );

    expect(writeDistFile.callCount).to.be.equal(1);

    const writeDistFileArgs = writeDistFile.firstCall.args;

    expect(writeDistFileArgs[0]).to.equal("united-kingdom");

    expect(writeDistFileArgs[1]).to.include(
      '<span class="header-edition">United Kingdom</span>'
    );

    expect(writeDistFileArgs[1]).to.include(
      `<a href="http://example.com/a" class="main-news-link" target="_blank" rel="noopener noreferrer">`
    );

    expect(syncDistFiles.calledOnce).to.be.true;
  });
});
