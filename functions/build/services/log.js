"use strict";

module.exports.logInfo = (data) => {
  if (process.env.NODE_ENV !== "test") {
    console.info(data);
  }
};

module.exports.logError = (data) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(data);
  }
};
