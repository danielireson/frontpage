"use strict";

const fs = require("./services/fs");
const rss = require("./services/rss");
const post = require("./services/post");
const template = require("./services/template");
const s3 = require("./services/s3");

module.exports.handler = (event, context, callback) => {
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

  editions.forEach((edition) => {
    const posts = [];

    edition.feeds.forEach((feed) => {
      try {
        posts.push(rss.fetchLatest(feed));
      } catch (error) {
        response.errors.push(`${feed}: ${error.message}`);
      }
    });

    const filteredPosts = post.filterPosts(posts);
    const html = template.buildTemplate(edition.name, filteredPosts);

    fs.createTempFile(edition.key, html);
  });

  s3.syncTempFiles();

  callback(null, response);
};
