"use strict";

const logger = require("./utils/logger");
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

  try {
    for (const edition of editions) {
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
    // rethrow build errors as they need handling
    logger.logError(`build error for ${edition.key}': ${error.message}`);
    throw error;
  }
}

async function sync() {
  try {
    await storageService.syncDistFiles();
  } catch (error) {
    // rethrow sync errors as they need handling
    logger.logError(`sync error: ${error.message}`);
    throw error;
  }
}
