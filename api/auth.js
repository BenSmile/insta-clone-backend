"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.signin = (event, callback) => {
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello to VDC app",
    }),
  });
};
