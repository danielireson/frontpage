"use strict";

module.exports.isValid = (edition) => {
  if (!edition) {
    return false;
  }

  return edition.toLowerCase() === "united-kingdom";
};

module.exports.fromCountryCode = (countryCode) => {
  if (countryCode === "GB") {
    return "united-kingdom";
  } else {
    return "international";
  }
};
