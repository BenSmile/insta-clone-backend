"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.signin = (event, callback) => {
  const rep = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello to Insta clone",
    }),
  };
  return rep;
};
