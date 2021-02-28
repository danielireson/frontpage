"use strict";

const MAX_POSTS = 25;

module.exports.filterPosts = (posts) => {
  return (posts || [])
    .sort((a, b) => 0.5 - Math.random())
    .slice(0, MAX_POSTS - 1);
};
