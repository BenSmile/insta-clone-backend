"use strict";

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, callback) => {
  if (!event.body) {
    const rep = {
      statusCode: 400,
      body: JSON.stringify({
        message: "Empty body",
      }),
    };
    return rep;
  }

  const requestBody = JSON.parse(event.body);
  const fullname = requestBody.fullname;
  const email = requestBody.email;
  const password = requestBody.password;
  const username = requestBody.username;
  const birthday = requestBody.bithday;
  const phone = requestBody.phone;

  if (
    typeof fullname !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof birthday !== "string" ||
    typeof username !== "string" ||
    typeof phone !== "string"
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
