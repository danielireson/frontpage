"use strict";

const fs = require("./services/fs");
const rss = require("./services/rss");
const post = require("./services/post");
const template = require("./services/template");
const s3 = require("./services/s3");

module.exports.handler = async (event, context, callback) => {
  let editions;

  try {
    editions = fs.requireFiles("editions", "json");
  } catch (error) {
    callback(error);
  }

  if (!editions.length) {
    console.error("Expected editions to be defined");
    return;
  }

  const response = {
    errors: [],
  };

  for (const edition of editions) {
    const posts = [];

    for (const feed of edition.feeds) {
      try {
        const latestPosts = await rss.fetchLatest(feed);
        posts.push(...latestPosts);
      } catch (error) {
        response.errors.push(`${feed}: ${error.message}`);
      }
    }

    const html = template.buildTemplate("edition", {
      name: edition.name,
      items: post.filterPosts(posts),
    });

    fs.createTempFile(edition.key, html);
  }

  s3.syncTempFiles();

  callback(null, response);
};
