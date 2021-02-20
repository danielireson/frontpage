"use strict";

const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const { minify } = require("html-minifier");

module.exports.buildTemplate = (templateName, data) => {
  const template = fs
    .readFileSync(path.resolve(__dirname, `../templates/${templateName}.hbs`))
    .toString("utf8");

  const compiledTemplate = handlebars.compile(template)(data);

  return minify(compiledTemplate, { collapseWhitespace: true });
};
