// Require AWS SDK and instantiate DocumentClient
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const { Model } = require("dynamodb-toolbox");
const { v4: uuidv4 } = require("uuid");
const { sendOpt } = require("./mail");
const { signToken } = require("./utils");

const User = new Model("User", {
  // Specify table name
  table: "test-users-table",

  // Define partition and sort keys
  partitionKey: "pk",
  sortKey: "sk",

  // Define schema
  schema: {
    pk: { type: "string", alias: "email" },
    sk: { type: "string", hidden: true, alias: "type" },
    id: { type: "string" },
    passwordHash: { type: "string" },
    createdAt: { type: "string" },
    phone: { type: "string" },
    bio: { type: "string" },
    avatar: { type: "string" },
    fullName: { type: "string" },
    birthDay: { type: "string" },
    username: { type: "string" },
    accountStatus: { type: "string" },
    followers: { type: "number" },
    following: { type: "number" },
    posts: { type: "number" },
    profile: { type: "string" },
    completedAt: { type: "string" },
  },
});

const Post = new Model("Post", {
  // Specify table name
  table: "posts-table",

  // Define partition and sort keys
  partitionKey: "pk",
  sortKey: "sk",

  // Define schema
  schema: {
    pk: { type: "string", alias: "id" },
    sk: { type: "string", alias: "type" },
    user: { type: "string" },
    title: { type: "string" },
    caption: { type: "string" },
    medias: { type: "list" },
    createdAt: { type: "string" },
    likes: { type: "string" },
  },
});

const Notification = new Model("Notification", {
  // Specify table name
  table: "notifications-table",

  // Define partition and sort keys
  partitionKey: "pk",
  sortKey: "sk",

  // Define schema
  schema: {
    pk: { type: "string", alias: "id" },
    sk: { type: "string", alias: "type" },
    date: { type: "string" },
    content: { type: "map" },
  },
});

const Otp = new Model("Otp", {
  // Specify table name
  table: "otp-table",

  // Define partition and sort keys
  partitionKey: "pk",
  sortKey: "sk",

  // Define schema
  schema: {
    pk: { type: "string", alias: "code" },
    sk: { type: "string", alias: "user" },
    // user: { type: "string" },
    createdAt: { type: "string" },
    expireAt: { type: "string" },
  },
});

const Like = new Model("Like", {
  // Specify table name
  table: "like-table",

  // Define partition and sort keys
  partitionKey: "pk",
  sortKey: "sk",

  // Define schema
  schema: {
    pk: { type: "string", alias: "id" },
    sk: { type: "string", alias: "type" },
    user: { type: "string" },
    post: { type: "string" },
    createdAt: { type: "string" },
  },
});

// INIT AWS
AWS.config.update({
  region: "eu-central-1",
});

const docClient = new AWS.DynamoDB.DocumentClient();

// const docClient = new AWS.DynamoDB.DocumentClient({
//   region: "localhost",
//   accessKeyId: "access_key_id",
//   secretAccessKeyId: "secret_access_key_id",
//   endpoint: "http://localhost:8080",
// });

const createDbUser = async (props) => {
  const params = User.put({
    ...props,
    id: uuidv4(),
    type: "User",
    createdAt: new Date(),
    accountStatus: "INACTIVE",
  });

  const response = await docClient.put(params).promise();
  const createUser = await getUserByEmail(props.email);
  console.log("email for otp -> ", createUser.email);
  const otp = Math.floor(100000 + Math.random() * 900000);
  try {
    await sendOpt(createUser.email, otp);
    await createOtp(createUser.email, otp);
  } catch (error) {
    console.log(error);
  }
  return User.parse(createUser);
};

const completeRegistration = async (props) => {
  const passwordHash = await bcrypt.hash(props.password, 8); // hash the pass
  delete props.password; // don't save it in clear text

  const params = User.update({
    ...props,
    type: "User",
    passwordHash,
    completedAt: new Date(),
    accountStatus: "ACTIVE",
    avatar:
      "https://www.privacy365.eu/wp-content/uploads/2021/06/blank-profile-picture-973460_1280.png",
  });
  const response = await docClient.update(params).promise();
  const updatedUser = await getUserByEmail(props.email);
  await notifyNewRegistration(updatedUser);
  const token = await signToken(updatedUser);
  console.log("token -> ", token);
  updatedUser.token = token;
  return User.parse(updatedUser);
};

const getUserByEmail = async (email) => {
  const params = User.get({ email, sk: "User" });
  const response = await docClient.get(params).promise();
  delete response.passwordHash;
  return User.parse(response);
};

const createOtp = async (optOwner, otp) => {
  let createdAt = new Date();
  let expireAt = new Date();
  expireAt.setTime(createdAt.getTime() + 2 * 60 * 1000);
  const params = Otp.put({
    // id: uuidv4(),
    code: otp,
    user: optOwner,
    createdAt,
    expireAt,
  });
  const response = await docClient.put(params).promise();
  return Otp.parse(response);
};

const getAllOtps = async () => {
  const params = {
    TableName: "otp-table",
  };
  const response = await docClient.scan(params).promise();
  return Otp.parse(response);
};

const getAllUsers = async () => {
  const params = {
    TableName: "test-users-table",
  };
  const response = await docClient.scan(params).promise();
  delete response.passwordHash;
  return User.parse(response);
};

const verifiyOtp = async (data) => {
  const { email, code } = data;

  console.log("user : ", email, "| ", code);

  const allOTPs = await getAllOtps();
  // console.log("rs -> ", allOTPs.length);

  const results = allOTPs.filter((otp) => otp.code === code);

  const codeFound = results[0];

  const newDate = new Date();
  const createdAt = Date.parse(codeFound.createdAt);

  const diffDate = (newDate - createdAt) / 1000;
  console.log(diffDate);
  if (diffDate > 120) {
    return {
      statusCode: 400,
      message: "Your code has expired",
    };
  } else {
    return {
      statusCode: 200,
      message: "OK",
    };
  }

  // const params = {
  //   TableName: "otp-table",
  //   Key: {
  //     code: code,
  //   },
  // };

  // const response = await docClient.get(params).promise();
  // console.log("rs -> ", response);

  // const params = {
  //   TableName: "otp-table",
  //   KeyConditionExpression: "#code = :code",
  //   ExpressionAttributeNames: {
  //     // "#user": "user",
  //     "#code": "code",
  //   },
  //   ExpressionAttributeValues: {
  //     // ":email": email,
  //     ":code": code,
  //   },
  // };
  // const response = await docClient.query(params).promise();
};

const notifyNewRegistration = async (data) => {
  const params = Notification.put({
    id: uuidv4(),
    type: "ACCOUNT_CREATION",
    date: new Date(),
    content: {
      message: `${data.fullName} joined Insta clone!`,
      link: `some link for mor details`,
    },
  });
  const response = await docClient.put(params).promise();
  return Notification.parse(response);
};

const getAllNotifications = async () => {
  const params = {
    TableName: "notifications-table",
  };
  const response = await docClient.scan(params).promise();
  const notifs = Notification.parse(response);
  let newNotifs = [];
  for (let i = 0; i < notifs.length; i++) {
    const notificationn = notifs[i];
    const newNotif = {
      ...post,
      createdAt: Date.parse(notificationn.createdAt),
      doILikeThePost: yesNot,
    };
    newNotifs = [...newNotifs, newNotif];
  }
  return Notification.parse(newNotifs);
};

const createPost = async (data, user) => {
  const params = Post.put({
    id: uuidv4(),
    type: "POST",
    createdAt: new Date(),
    user: user,
    title: data.title,
    caption: data.caption,
    medias: [
      "https://api.time.com/wp-content/uploads/2019/08/better-smartphone-photos.jpg?w=1600&quality=70",
      "http://thedreamwithinpictures.com/wp-content/uploads/2012/04/c2030__children-photography.jpg",
      "https://tunza.eco-generation.org/file/environment-earth-day-hands-trees-growing-seedlings_34998-113.jpg",
    ],
    likes: 0,
  });
  const response = await docClient.put(params).promise();
  return Post.parse(response);
};

const getAllPosts = async () => {
  const params = {
    TableName: "posts-table",
  };

  const response = await docClient.scan(params).promise();
  const posts = Post.parse(response);
  let newPosts = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const newPost = {
      ...post,
      createdAt: Date.parse(post.createdAt),
    };
    newPosts = [...newPosts, newPost];
  }
  return Post.parse(newPosts);
};

const getAllPostsConnectedUser = async (user) => {
  const params = {
    TableName: "posts-table",
  };
  const response = await docClient.scan(params).promise();
  const posts = Post.parse(response);
  let newPosts = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const yesNot = await doILikeThePost(post.id, user);
    const newPost = {
      ...post,
      createdAt: Date.parse(post.createdAt),
      doILikeThePost: yesNot,
    };
    newPosts = [...newPosts, newPost];
  }

  return Post.parse(response);
};

const getOnePost = async (id) => {
  const params = Post.get({ id, sk: "POST" });
  const response = await docClient.get(params).promise();
  return Post.parse(response);
};

const getPostsByUser = async (username) => {
  const params = {
    TableName: "posts-table",
  };
  const response = await docClient.scan(params).promise();
  return Notification.parse(response);
};

const likePost = async (post, user) => {
  const params = Like.put({
    id: uuidv4(),
    type: "LIKE",
    user: user,
    post: post,
    createdAt: new Date(),
  });
  const response = await docClient.put(params).promise();

  const likedPost = await getOnePost(post);

  // const lps = likedPost.likes;
  // likedPost.likes = lps + 1;

  // console.log("liked post ", likedPost);

  const updatePostParams = Post.update({
    ...likedPost,
    likes: parseInt(likedPost.likes) + 1,
  });
  const r = await docClient.update(updatePostParams).promise();

  return Like.parse(response);
};

const getAllLikes = async () => {
  const params = {
    TableName: "like-table",
  };
  const response = await docClient.scan(params).promise();
  return Like.parse(response);
};

const countLikesByPost = async (post) => {
  const likes = await getAllLikes();
  console.log(likes);
  const count = likes.filter((like) => like.post === post).length;
  return count;
};

const doILikeThePost = async (post, user) => {
  const likes = await getAllLikes();
  const count = likes.filter(
    (like) => like.post === post && like.user === user
  ).length;
  return count > 0;
};

module.exports = {
  createDbUser,
  getUserByEmail,
  createOtp,
  completeRegistration,
  getAllUsers,
  getAllOtps,
  verifiyOtp,
  getAllNotifications,
  createPost,
  getAllPosts,
  getPostsByUser,
  getOnePost,
  likePost,
  getAllPostsConnectedUser,
};
