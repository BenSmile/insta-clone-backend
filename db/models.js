// Require AWS SDK and instantiate DocumentClienti
const AWS = require("aws-sdk");
const { Model } = require("dynamodb-toolbox");

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
    username: { type: "string" },
    createdAt: { type: "string" },
    likes: { type: "number" },
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
//
// const docClient = new AWS.DynamoDB.DocumentClient({
//   region: "localhost",
//   accessKeyId: "access_key_id",
//   secretAccessKeyId: "secret_access_key_id",
//   endpoint: "http://localhost:8080",
// });

const getUserByEmail = async (email) => {
  const params = User.get({ email, sk: "User" });
  const response = await docClient.get(params).promise();
  delete response.passwordHash;
  return User.parse(response);
};

module.exports = {
  getUserByEmail,
  Like,
  Post,
  User,
  Otp,
  Notification,
  docClient,
};
