import Parser from "rss-parser";
const parser = new Parser();

const MAX_POSTS = 10;

export const fetchLatest = async (feedURL) => {
  const feed = await parser.parseURL(feedURL);

  return (feed.items || [])
    .sort((a, b) => 0.5 - Math.random())
    .slice(0, MAX_POSTS - 1);
};

export default {
  fetchLatest,
};
