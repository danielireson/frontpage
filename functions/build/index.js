"use strict";

const log = require("./services/log");
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
    callback(new Error("Expected editions to be defined"));
    return;
  }

  const response = {
    info: [],
    error: [],
  };

  for (const edition of editions) {
    const posts = [];

    for (const feed of edition.feeds) {
      try {
        const latestPosts = await rss.fetchLatest(feed);
        posts.push(...latestPosts);
      } catch (error) {
        // allow fetch errors but track them
        response.info.push(`fetch(${feed}): ${error.message}`);
      }
    }

    try {
      const html = template.buildTemplate("edition", {
        name: edition.name,
        items: post.filterPosts(posts),
      });

      fs.writeDistFile(edition.key, html);
    } catch (error) {
      // build errors should not occur
      response.error.push(`build(${edition.key}): ${error.message}`);
    }
  }

  try {
    await s3.syncDistFiles();
  } catch (error) {
    // sync errors should not occur
    response.error.push(`sync: ${error.message}`);
  }

  if (response.error.length) {
    log.error(response);
    callback(new Error("Build failed"));
  } else {
    callback(null, response);
  }
};
