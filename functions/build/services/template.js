"use strict";

const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");

module.exports.buildTemplate = (templateName, data) => {
  const template = fs
    .readFileSync(path.resolve(__dirname, `../templates/${templateName}.hbs`))
    .toString("utf8");

  return handlebars.compile(template)(data);
};
