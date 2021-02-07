const { expect } = require("chai");
const { spy } = require("sinon");
const { handler } = require("../../../functions/build");

describe("build", function () {
  it("example test", function () {
    // given
    const event = {};
    const context = {};
    const callback = spy();

    // when
    handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;
  });
});
