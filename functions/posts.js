const { createPost, getAllPosts } = require("../lib/db");

module.exports.create = async function addPost(event) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty body" }),
    };
  }
  const body = event.body;

  await createPost(body);
};

module.exports.allPosts = async function allPosts(event) {
  const posts = await getAllPosts();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(posts),
  };
};
