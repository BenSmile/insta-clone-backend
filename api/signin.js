"use strict";

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, callback) => {
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
