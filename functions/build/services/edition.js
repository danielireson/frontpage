"use strict";

const path = require("path");
const fs = require("fs");

module.exports.readEditions = () => {
  const rootPath = path.resolve(__dirname, "../editions");

  return fs
    .readdirSync(rootPath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => require(path.resolve(rootPath, file)));
};
