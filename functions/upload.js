const AWS = require("aws-sdk");
const { parse } = require("aws-multipart-parser");
const { v4: uuidv4 } = require("uuid");
const { createPost } = require("../lib/db");
const { updloadonS3 } = require("./uploadS3");
const s3 = new AWS.S3();

const BUCKET_NAME = "serverless-jwt-authorizer-bucket-dev";
const AWS_REGION = process.env.AWS_REGION;
const subFolder = "data";

module.exports.handler = async (event) => {
  try {
    const formData = parse(event, true);
    const imgPath = await updloadonS3(formData.file);
    const post = {
      caption: formData.caption,
      title: formData.title,
      medias: [imgPath],
    };

    await createPost(post, "bkafirongo@gmail.com");
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: "Post create successfully" }),
    };
  } catch (e) {
    console.log(e);

    return {
      statusCode: 500,

      body: JSON.stringify({
        message: "File failed to upload",
        errorMessage: e,
      }),
    };
  }
};
