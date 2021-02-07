const { expect } = require("chai");
const { handler } = require("../../../functions/build");

describe("build", function () {
  it("example test", function () {
    // given
    const event = {};
    const context = {};
    const callback = () => {};

    // when
    handler(event, context, callback);

    // then
    expect(true).to.be.true;
  });
});
