const AWS = require("aws-sdk");
const { parse } = require("aws-multipart-parser");
const { v4: uuidv4 } = require("uuid");
const { createPost } = require("../lib/db");
const { updloadonS3 } = require("./uploadS3");
const { getUserFromToken } = require("../lib/utils");
const s3 = new AWS.S3();

const BUCKET_NAME = "serverless-jwt-authorizer-bucket-dev";
const AWS_REGION = process.env.AWS_REGION;
const subFolder = "data";

module.exports.handler = async (event) => {
  try {

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Empty body" }),
      };
    }
  
    if (!event.headers.Authorization) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Plz, provide an token" }),
      };
    }
    console.log('form data => ',event);
    const userObj = await getUserFromToken(event.headers.Authorization);
    const formData = parse(event, true);
    console.log('form data => ',formData);
    const imgPath = await updloadonS3(formData.file);
    const post = {
      caption: formData.caption,
      title: formData.title,
      medias: [imgPath],
    };

    await createPost(post, userObj.email);
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
