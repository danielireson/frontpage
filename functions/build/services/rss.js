"use strict";

const Parser = require("rss-parser");
const parser = new Parser();

module.exports.fetchLatest = async (feedURL) => {
  const feed = await parser.parseURL(feedURL);

  return feed.items || [];
};
