const { createPost, getAllPosts, likePost } = require("../lib/db");
const { getUserFromToken } = require("../lib/utils");

module.exports.create = async function addPost(event) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty body" }),
    };
  }

  if (!event.headers.Authorization) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Plz, provide an token" }),
    };
  }
  try {
    const userObj = await getUserFromToken(event.headers.Authorization);
    console.log("user-> ", userObj.email);
    const body = JSON.parse(event.body);
    await createPost(body, userObj.email);
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: "Post create successfully" }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

module.exports.allPosts = async function allPosts(event) {
  
  const posts = await getAllPosts();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(posts),
  };
};

module.exports.like = async function (event) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Empty body" }),
      };
    }

    if (!event.headers.Authorization) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Plz, provide an token" }),
      };
    }

    const body = JSON.parse(event.body);

    if (!body.post) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "post is required",
        }),
      };
    }

    const userObj = await getUserFromToken(event.headers.Authorization);

    await likePost(body.post, userObj.email);
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: "Post liked successfully" }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};
