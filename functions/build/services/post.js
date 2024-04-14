const MAX_POSTS = 25;

export const filterPosts = (posts) => {
  return (posts || [])
    .sort((a, b) => 0.5 - Math.random())
    .slice(0, MAX_POSTS - 1);
};

export default {
  filterPosts,
};
