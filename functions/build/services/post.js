"use strict";

module.exports.filterPosts = (posts) => {
  return posts.sort((a, b) => 0.5 - Math.random()).slice(0, 24);
};
