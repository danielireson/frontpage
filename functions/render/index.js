const VALID_EDITIONS = ["AU", "CA", "GB", "IE", "NZ", "US"];

export const handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const country = request.headers["cloudfront-viewer-country"];
  const countryCode = country && (country[0] ? country[0].value : null);

  if (VALID_EDITIONS.includes(countryCode)) {
    // localised edition exists
    request.uri = `/${countryCode}.html`;
  } else {
    // fallback to international edition
    request.uri = "/INT.html";
  }

  callback(null, request);
};
