// Require AWS SDK and instantiate DocumentClient
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const { Model } = require("dynamodb-toolbox");
const { v4: uuidv4 } = require("uuid");
const { sendOpt } = require("./mail");
const { signToken } = require("./utils");

const {
  User,
  Notification,
  Post,
  Like,
  Otp,
  docClient,
} = require("../db/models");


const createDbUser = async (props) => {
  const params = User.put({
    ...props,
    id: uuidv4(),
    type: "User",
    createdAt: new Date(),
    accountStatus: "INACTIVE",
  });

  await docClient.put(params).promise();
  const createUser = await getUserByEmail(props.email);
  await sendOtpToClient(createUser.email);
  return User.parse(createUser);
};

const sendOtpToClient = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("email for otp -> ", email);
  try {
    await sendOpt(email, otp);
    await createOtp(email, otp);
  } catch (error) {
    console.log(error);
  }
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
      "https://www.senalia.com/wp-content/themes/tractor/assets/images/avatar-placeholder.jpg",
  });
  const response = await docClient.update(params).promise();
  const updatedUser = await getUserByEmail(props.email);
  await notifyNewRegistration(updatedUser);
  const token = await signToken(updatedUser);
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
  expireAt.setTime(createdAt.getTime() + 5 * 60 * 1000);
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

  const results = allOTPs.filter((otp) => otp.code === code);

  const codeFound = results[0];

  if (!codeFound) {
    return {
      statusCode: 400,
      message: "No code found",
    };
  }

  const newDate = new Date();
  const createdAt = Date.parse(codeFound.createdAt);

  const diffDate = (newDate - createdAt) / 1000;
  console.log(diffDate);
  if (diffDate > 300) {
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
      ...notificationn,
      createdAt: Date.parse(notificationn.date),
    };
    newNotifs = [...newNotifs, newNotif];
  }
  return Notification.parse(newNotifs);
};

const createPost = async (data, user) => {
  const foundUser = await getUserByEmail(user);
  console.log("username -", foundUser.username);
  const params = Post.put({
    id: uuidv4(),
    type: "POST",
    createdAt: new Date(),
    user: user,
    username: foundUser.username,
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
  await notifyNewPost({ username: foundUser.username });
  return Post.parse(response);
};

const updatePost = async (post) => {
  const params = Post.update({
    ...post,
  });
  const response = await docClient.update(params).promise();
  return Post.parse(response);
};

const deletePost = async (postId) => {
  const params = Post.delete({
    id: postId,
    type: "POST",
  });
  const response = await docClient.delete(params).promise();
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
    let username2 = post.username;
    if (!username2) {
      const user = await getUserByEmail(post.user);
      username2 = user.username;
    }
    const newPost = {
      ...post,
      createdAt: Date.parse(post.createdAt),
      username: username2,
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
    let username2 = post.username;
    if (!username2) {
      const user = await getUserByEmail(post.user);
      username2 = user.username;
    }
    const yesNot = await doILikeThePost(post.id, user);
    const newPost = {
      ...post,
      createdAt: Date.parse(post.createdAt),
      liked_by_me: yesNot,
      username: username2,
    };
    newPosts = [...newPosts, newPost];
  }
  return Post.parse(newPosts);
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
  const updatePostParams = Post.update({
    ...likedPost,
    likes: parseInt(likedPost.likes) + 1,
  });
  await docClient.update(updatePostParams).promise();
  const foundUser = await getUserByEmail(user);
  await notifyLikePost({ username: foundUser.username });
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
  // console.log(likes);
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

const notifyNewPost = async (data) => {
  console.log("data notif -> ", data);
  const params = Notification.put({
    id: uuidv4(),
    type: "POST_CREATEION",
    date: new Date(),
    content: {
      message: `${data.username} created a new post!`,
      link: `some link for mor details`,
    },
  });
  const response = await docClient.put(params).promise();
  return Notification.parse(response);
};

const notifyLikePost = async (data) => {
  console.log("data notif -> ", data);
  const params = Notification.put({
    id: uuidv4(),
    type: "LIKE_POST",
    date: new Date(),
    content: {
      message: `${data.username} liked a post`,
      link: `some link for mor details`,
    },
  });
  const response = await docClient.put(params).promise();
  return Notification.parse(response);
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
  updatePost,
  deletePost,
  sendOtpToClient,
};
