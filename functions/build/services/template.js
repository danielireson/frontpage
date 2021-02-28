"use strict";

const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const { minify } = require("html-minifier");

const TEMPLATE_DIR = "../templates";

module.exports.buildTemplate = (templateName, data) => {
  const template = fs
    .readFileSync(path.resolve(__dirname, TEMPLATE_DIR, `${templateName}.hbs`))
    .toString("utf8");

  const compiledTemplate = handlebars.compile(template)(data);

  return minify(compiledTemplate, {
    collapseWhitespace: true,
    minifyCSS: true,
  });
};
