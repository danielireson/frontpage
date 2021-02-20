"use strict";

const path = require("path");
const fs = require("fs");

module.exports.requireFiles = (fileDirectory, extension) => {
  const rootPath = path.resolve(__dirname, `../${fileDirectory}`);

  return fs
    .readdirSync(rootPath)
    .filter((file) => file.endsWith(`.${extension}`))
    .map((file) => require(path.resolve(rootPath, file)));
};

module.exports.createDistFile = (fileName, data) => {
  fs.writeFileSync(path.resolve(__dirname, `../dist/${fileName}.html`), data);
};
