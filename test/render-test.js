import { expect } from "chai";
import sinon from "sinon";
import { handler } from "../functions/render/index.js";

describe("render", function () {
  afterEach(function () {
    sinon.restore();
  });

  it("should localise the edition to country code", function () {
    // given
    const event = {
      Records: [
        {
          cf: {
            request: {
              querystring: "",
              headers: {
                "cloudfront-viewer-country": [
                  {
                    value: "GB",
                  },
                ],
              },
            },
          },
        },
      ],
    };
    const context = {};
    const callback = sinon.spy();

    // when
    handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[1], "request").to.exist;
    expect(callbackArgs[1].uri, "request").to.equal("/GB.html");
  });

  it("should default to international edition", function () {
    // given
    const event = {
      Records: [
        {
          cf: {
            request: {
              querystring: "",
              headers: {},
            },
          },
        },
      ],
    };
    const context = {};
    const callback = sinon.spy();

    // when
    handler(event, context, callback);

    // then
    expect(callback.calledOnce).to.be.true;

    const callbackArgs = callback.firstCall.args;

    expect(callbackArgs[1], "request").to.exist;
    expect(callbackArgs[1].uri, "request").to.equal("/INT.html");
  });
});
