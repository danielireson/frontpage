"use strict";

const log = require("./services/log");
const edition = require("./services/edition");
const fs = require("./services/fs");
const rss = require("./services/rss");
const post = require("./services/post");
const template = require("./services/template");
const s3 = require("./services/s3");

module.exports.handler = async (event, context, callback) => {
  let editions;

  try {
    editions = edition.readEditions();
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

  for (const editionToBuild of editions) {
    const posts = [];

    for (const feedToFetch of editionToBuild.feeds) {
      try {
        const latestPosts = await rss.fetchLatest(feedToFetch);
        posts.push(...latestPosts);
      } catch (error) {
        // allow fetch errors but track them
        response.info.push(`fetch(${feedToFetch}): ${error.message}`);
      }
    }

    try {
      const html = template.buildTemplate("edition", {
        name: editionToBuild.name,
        items: post.filterPosts(posts),
      });

      fs.writeDistFile(editionToBuild.key, html);
    } catch (error) {
      // build errors should not occur
      response.error.push(`build(${editionToBuild.key}): ${error.message}`);
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
