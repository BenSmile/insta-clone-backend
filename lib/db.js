// Require AWS SDK and instantiate DocumentClient
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const { Model } = require("dynamodb-toolbox");
const { v4: uuidv4 } = require("uuid");
const { sendOpt } = require("./mail");

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

// INIT AWS
AWS.config.update({
  region: "eu-central-1",
});

// const docClient = new AWS.DynamoDB.DocumentClient();

const docClient = new AWS.DynamoDB.DocumentClient({
  region: "localhost",
  accessKeyId: "access_key_id",
  secretAccessKeyId: "secret_access_key_id",
  endpoint: "http://localhost:8080",
});

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
  });
  const response = await docClient.update(params).promise();
  const updatedUser = await getUserByEmail(props.email);
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
    TableName: "otps-table",
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
  console.log("rs -> ", allOTPs.length);

  const results = allOTPs.filter((otp) => otp.code === code);

  const codeFound = results[0];

  const newDate = new Date();
  const createdAt = Date.parse(codeFound.createdAt);
  const expireAt = Date.parse(codeFound.expireAt);

  // console.log("1 ", (newDate - createdAt) / 1000);
  // console.log("2 ", (expireAt - createdAt) / 1000);

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
  //   TableName: "otps-table",
  //   Key: {
  //     code: code,
  //   },
  // };

  // const response = await docClient.get(params).promise();
  // console.log("rs -> ", response);

  // const params = {
  //   TableName: "otps-table",
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

module.exports = {
  createDbUser,
  getUserByEmail,
  createOtp,
  completeRegistration,
  getAllUsers,
  getAllOtps,
  verifiyOtp,
};
