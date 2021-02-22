"use strict";

const path = require("path");
const fs = require("fs");

module.exports.writeDistFile = (fileName, data) => {
  fs.writeFileSync(path.resolve(__dirname, `../dist/${fileName}.html`), data);
};

module.exports.readDistDirectory = () => {
  const rootPath = path.resolve(__dirname, "../dist");

  return fs.readdirSync(rootPath).filter((file) => file.endsWith(".html"));
};

module.exports.readDistFile = (fileName) => {
  return fs.readFileSync(path.resolve(__dirname, `../dist/${fileName}`));
};
