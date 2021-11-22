const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const s3 = new AWS.S3();

const BUCKET_NAME = "serverless-jwt-authorizer-bucket-dev";
const AWS_REGION = process.env.AWS_REGION;
const subFolder = "data";

module.exports.updloadonS3 = async (file) => {
  try { 
    const ext = file.contentType.split("/")[1];
    const fileName = `${uuidv4()}.${ext}`;

    const param = {
      Bucket: BUCKET_NAME,
      Key: `${subFolder}/${fileName}`,
      Body: file.content,
    };

    // https://serverless-jwt-authorizer-bucket-dev.s3.eu-central-1.amazonaws.com/data/linkendin.png
    const imgPath = `https://${BUCKET_NAME}.s3.${process.env.region}.amazonaws.com/${subFolder}/${fileName}`;

    console.log("path -> ", imgPath);
    await s3.putObject(param).promise();

    return imgPath;
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
