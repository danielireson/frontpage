"use strict";

const path = require("path");
const fs = require("fs");

const rootPath =
  process.env.NODE_ENV === "production"
    ? "/tmp"
    : path.resolve(__dirname, "../dist");

module.exports.writeDistFile = (fileName, data) => {
  fs.writeFileSync(path.resolve(rootPath, `${fileName}.html`), data);
};

module.exports.readDistDirectory = () => {
  return fs.readdirSync(rootPath).filter((file) => file.endsWith(".html"));
};

module.exports.readDistFile = (fileName) => {
  return fs.readFileSync(path.resolve(rootPath, `${fileName}`));
};
