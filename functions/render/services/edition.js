"use strict";

module.exports.fromCountryCode = (countryCode) => {
  if (countryCode === "GB") {
    return "united-kingdom";
  } else {
    return "international";
  }
};
