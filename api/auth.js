"use strict";

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.signin = async (event, callback) => {
  if (!event.body) {
    const rep = {
      statusCode: 400,
      body: JSON.stringify({
        message: "Username and password are required",
      }),
    };
    return rep;
  }

  const requestBody = JSON.parse(event.body);
  const username = requestBody.username;
  const password = requestBody.password;

  if (!event.body) {
    const rep = {
      statusCode: 400,
      body: JSON.stringify({
        message: "Username and password are required",
      }),
    };
    return rep;
  }

  if (typeof username !== "string" || typeof password !== "string") {
    console.error("Validation Failed");
    const rep = {
      statusCode: 400,
      body: JSON.stringify({
        message: "Username or password required",
      }),
    };
    return rep;
  }

  const params = {
    TableName: 'USERS',
    Key: {
      username: username,
    },
  };

  const result = await dynamoDb.get(params);

  console.log('item = ',result?.Item);
};

module.exports.signup = (event, callback) => {
  const requestBody = JSON.parse(event.body);
  const fullname = requestBody.fullname;
  const email = requestBody.email;
  const password = requestBody.password;
  const username = requestBody.username;
  const birthday = requestBody.bithday;

  if (
    typeof fullname !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof birthday !== "string" ||
    typeof username !== "string"
  ) {
    console.error("Validation Failed");
    callback(new Error("Validation errors."));
    return;
  }

  const userData = { fullname, username, password, birthday, email };
  createAccount(userData)
    .then((res) => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Registration succeeded`,
          id: res.id,
        }),
      });
    })
    .catch((err) => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Registration failed`,
        }),
      });
    });
};

const createAccount = (user) => {
  console.log("Submitting candidate");
  const userData = {
    TableName: process.env.USER_TABLE,
    Item: user,
  };
  return dynamoDb
    .put(userData)
    .promise()
    .then((res) => user);
};
