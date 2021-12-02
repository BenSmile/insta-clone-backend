const {
    createPost2,
    getAllPosts,
    likePost,
    getAllPostsConnectedUser,
    updatePost,
    deletePost,
} = require("../lib/db");
const {getUserFromToken} = require("../lib/utils");

module.exports.create = async function addPost(event) {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: "Empty body"}),
        };
    }

    if (!event.headers.Authorization) {
        return {
            statusCode: 403,
            body: JSON.stringify({message: "Plz, provide an token"}),
        };
    }
    try {
        const userObj = await getUserFromToken(event.headers.Authorization);
        console.log("user-> ", userObj.email);
        const body = JSON.parse(event.body);
        await createPost2(body, userObj.email);
        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify({message: "Post create successfully"}),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({error}),
        };
    }
};

module.exports.update = async function (event) {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({message: "Empty body"}),
        };
    }

    if (!event.headers.Authorization) {
        return {
            statusCode: 403,
            body: JSON.stringify({message: "Plz, provide an token"}),
        };
    }

    try {
        const userObj = await getUserFromToken(event.headers.Authorization);
        console.log("user-> ", userObj.email);
        const body = JSON.parse(event.body);
        await updatePost(body);
        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify({message: "Post updated successfully"}),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({error}),
        };
    }
};

module.exports.allPosts = async function (event) {
    let posts = await getAllPosts();

    try {
        if (event.headers.Authorization) {
            const userObj = await getUserFromToken(event.headers.Authorization);
            posts = await getAllPostsConnectedUser(userObj.email);
        }
    } catch (error) {
        console.log(error);
        posts = await getAllPosts();
    }

    return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify(posts),
    };
};

module.exports.like = async function (event) {
  console.log('event -> ', event);
  try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "Empty body"}),
            };
        }

        if (!event.headers.Authorization) {
            return {
                statusCode: 403,
                body: JSON.stringify({message: "Not authorized"}),
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
            body: JSON.stringify({message: "Post updated successfully"}),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({error}),
        };
    }
};

module.exports.delete = async function (event) {
    try {
        console.log('event -> ', event);

        if (!event.headers.Authorization) {
            return {
                statusCode: 403,
                body: JSON.stringify({message: "Not authorized"}),
            };
        }

        const postId = event.pathParameters.postId;

        if (event.headers.Authorization) {
            const userObj = await getUserFromToken(event.headers.Authorization);
            posts = await deletePost(postId);

            return {
                statusCode: 200,
                headers: {},
                body: JSON.stringify({message: "Post deleted successfully"}),
            };
        }
    } catch (error) {
        console.log(error);
    }
};
