"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.signin = (event, callback) => {
  const requestBody = JSON.parse(event.body);
  const username = requestBody.username;
  const password = requestBody.password;

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
    TableName: process.env.USER_TABLE,
    Key: {
      username: username,
    },
  };

  const result = await dynamoDb.get(params);

  console.log(result);

  //   dynamoDb
  //     .get(params)
  //     .promise()
  //     .then((result) => {
  //       const response = {
  //         statusCode: 200,
  //         body: JSON.stringify(result.Item),
  //       };
  //       callback(null, response);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       callback(new Error("Invalid credentials."));
  //       return;
  //     });
};

module.exports.signup = (event, callback) => {
  const requestBody = JSON.parse(event.body);
  const fullname = requestBody.fullname;
  const email = requestBody.email;
  const password = requestBody.password;
  const bithday = requestBody.bithday;

  if (
    typeof fullname !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof bithday !== "string"
  ) {
    console.error("Validation Failed");
    callback(
      new Error("Validation errors.")
    );
    return;
  }

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