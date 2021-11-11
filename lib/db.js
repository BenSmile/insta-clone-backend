// Require AWS SDK and instantiate DocumentClient
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const { Model } = require("dynamodb-toolbox");
const { v4: uuidv4 } = require("uuid");

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
    sk: { type: "string", hidden: true, alias: "type" },
    title: { type: "string" },
    content: { type: "string" },
  },
});

const Otp = new Model("Otp", {
  // Specify table name
  table: "otps-table",

  // Define partition and sort keys
  partitionKey: "pk",

  // Define schema
  schema: {
    pk: { type: "string", alias: "id" },
    opt: { type: "string" },
    optOwner: { type: "string" },
    createdAt: { type: "string" },
    expireAt: { type: "string" },
  },
});

// INIT AWS
AWS.config.update({
  region: "eu-central-1",
});

const docClient = new AWS.DynamoDB.DocumentClient();

const createDbUser = async (props) => {
  const passwordHash = await bcrypt.hash(props.password, 8); // hash the pass
  delete props.password; // don't save it in clear text

  const params = User.put({
    ...props,
    id: uuidv4(),
    type: "User",
    passwordHash,
    createdAt: new Date(),
  });

  console.log("create user with params", params);

  const response = await docClient.put(params).promise();

  return User.parse(response);
};

const getUserByEmail = async (email) => {
  const params = User.get({ email, sk: "User" });
  const response = await docClient.get(params).promise();

  return User.parse(response);
};

const createOtp = async (optOwner, otp) => {
  var createdAt = new Date();
  var expireAt = new Date();
  expireAt.setTime(createdAt.getTime() + 2 * 60 * 1000);
  const params = Otp.put({
    otp,
    optOwner,
    createdAt:new Date(),
    expireAt :new Date(),
  });
  const response = await docClient.put(params).promise();
  return Otp.parse(response);
};

module.exports = {
  createDbUser,
  getUserByEmail,
  createOtp,
};
