"use strict";

module.exports.info = (data) => {
  if (process.env.NODE_ENV !== "test") {
    console.info(data);
  }
};

module.exports.error = (data) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(data);
  }
};
