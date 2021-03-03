"use strict";

const logger = require("./utils/logger");
const editionService = require("./services/edition");
const rssService = require("./services/rss");
const postService = require("./services/post");
const templateService = require("./services/template");
const storageService = require("./services/storage");

module.exports.handler = async (event, context, callback) => {
  try {
    for (const edition of load()) {
      const posts = [];

      for (const feed of edition.feeds) {
        const latest = await fetch(feed);
        posts.push(...latest);
      }

      await build(edition, posts);
    }

    await sync();

    callback(null, { message: "Successfully built editions" });
  } catch (error) {
    callback(new Error("Build failed"));
  }
};

function load() {
  try {
    const editions = editionService.readEditions();

    if (!editions.length) {
      throw new Error("Expected editions to be defined");
    }

    return editions;
  } catch (error) {
    logger.logError(`config error: ${error.message}`);
    throw error;
  }
}

async function fetch(feed) {
  const posts = [];

  try {
    const latestPosts = await rssService.fetchLatest(feed);
    posts.push(...latestPosts);
  } catch (error) {
    // do not rethrow fetch errors but track them
    logger.logInfo(`fetch error for ${feed}: ${error.message}`);
  }

  return posts;
}

async function build(edition, posts) {
  try {
    const html = templateService.buildTemplate("edition", {
      name: edition.name,
      items: postService.filterPosts(posts),
    });

    storageService.writeDistFile(edition.key, html);
  } catch (error) {
    logger.logError(`build error for ${edition.key}': ${error.message}`);
    throw error;
  }
}

async function sync() {
  try {
    await storageService.syncDistFiles();
  } catch (error) {
    logger.logError(`sync error: ${error.message}`);
    throw error;
  }
}
