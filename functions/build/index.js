"use strict";

const logService = require("./services/log");
const editionService = require("./services/edition");
const rssService = require("./services/rss");
const postService = require("./services/post");
const templateService = require("./services/template");
const storageService = require("./services/storage");

module.exports.handler = async (event, context, callback) => {
  let editions;

  try {
    editions = editionService.readEditions();
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
        const latestPosts = await rssService.fetchLatest(feed);
        posts.push(...latestPosts);
      } catch (error) {
        response.info.push(`fetch(${feed}): ${error.message}`);
        logService.logError(error);
      }
    }

    try {
      const html = templateService.buildTemplate("edition", {
        name: edition.name,
        items: postService.filterPosts(posts),
      });

      storageService.writeDistFile(edition.key, html);
    } catch (error) {
      response.error.push(`build(${edition.key}): ${error.message}`);
      logService.logError(error);
    }
  }

  try {
    await storageService.syncDistFiles();
  } catch (error) {
    response.error.push(`sync: ${error.message}`);
    logService.logError(error);
  }

  logService.logInfo(response);

  if (response.error.length) {
    callback(new Error("Build failed"));
  } else {
    callback(null, response);
  }
};
