import logger from "./utils/logger.js";
import editionService from "./services/edition.js";
import rssService from "./services/rss.js";
import postService from "./services/post.js";
import templateService from "./services/template.js";
import storageService from "./services/storage.js";

export const handler = async (event, context, callback) => {
  try {
    for (const definition of loadEditionDefinitions()) {
      const posts = [];

      for (const feed of definition.feeds) {
        const latestPosts = await fetchLatestPosts(feed);
        posts.push(...latestPosts);
      }

      await buildEdition(definition, posts);
    }

    await syncEditions();

    callback(null, "Build succeeded");
  } catch (error) {
    callback(new Error("Build failed"));
  }
};

function loadEditionDefinitions() {
  try {
    const editions = editionService.loadDefinitions();

    if (!editions.length) {
      throw new Error("Expected editions to be defined");
    }

    return editions;
  } catch (error) {
    logger.logError(`config error: ${error.message}`);
    throw error;
  }
}

async function fetchLatestPosts(feed) {
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

async function buildEdition(edition, posts) {
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

async function syncEditions() {
  try {
    await storageService.syncDistFiles();
  } catch (error) {
    logger.logError(`sync error: ${error.message}`);
    throw error;
  }
}
