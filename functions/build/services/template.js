import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { minify } from "html-minifier";

const __dirname = import.meta.dirname;

const TEMPLATE_DIR = "../templates";

export const buildTemplate = (templateName, data) => {
  const template = fs.readFileSync(
    path.resolve(__dirname, TEMPLATE_DIR, `${templateName}.hbs`),
    "utf8"
  );

  const compiledTemplate = handlebars.compile(template)(data);

  return minify(compiledTemplate, {
    collapseWhitespace: true,
    minifyCSS: true,
  });
};

export default {
  buildTemplate,
};
