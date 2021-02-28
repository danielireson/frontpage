"use strict";

const path = require("path");
const fs = require("fs");

const EDITIONS_DIR = "../editions";

module.exports.readEditions = () => {
  const rootPath = path.resolve(__dirname, EDITIONS_DIR);

  return fs
    .readdirSync(rootPath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => require(path.resolve(rootPath, file)));
};
