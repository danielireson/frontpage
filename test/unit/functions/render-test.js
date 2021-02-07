const { expect } = require("chai");
const { spy } = require("sinon");
const { handler } = require("../../../functions/render");

describe("render", function () {
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
