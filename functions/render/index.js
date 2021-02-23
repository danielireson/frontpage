"use strict";

const querystring = require("querystring");
const edition = require("./services/edition");

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const params = querystring.parse(request.querystring);
  const country = request.headers["cloudfront-viewer-country"];
  const countryCode = country && (country[0] ? country[0].value : null);

  if (edition.isValid(params.edition)) {
    // override edition by query parameter
    request.uri = `/${params.edition}.html`;
  } else if (countryCode) {
    // determine edition from country code
    request.uri = `/${edition.fromCountryCode(countryCode)}.html`;
  } else {
    // fallback to international edition
    request.uri = "/international.html";
  }

  callback(null, request);
};
