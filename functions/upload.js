const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const BUCKET_NAME = "serverless-jwt-authorizer-bucket-dev";
const AWS_REGION = process.env.AWS_REGION;
const subFolder = "data";

module.exports.handler = async (event) => { 
  console.log(event);
  console.log(event.files);

  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify({ message: "Successfully uploaded file to S3" }),
  };

  try {
    const body = event.body;

    const fileName = body
      .split("\r\n")[1]
      .split(";")[2]
      .split("=")[1]
      .replace(/^"|"$/g, "")
      .trim();
    let fileContent = body.split("\r\n")[4].replace('\n','').trim();

    const param = {
      Bucket: BUCKET_NAME,
      Key: `${subFolder}/${fileName}`,
      Body: fileContent,
    };

    // https://serverless-jwt-authorizer-bucket-dev.s3.eu-central-1.amazonaws.com/data/linkendin.png

    const res = await s3.putObject(param).promise();
    console.log("res -> ", res);
    // fileContent += `\n\nProcess Timestamp: ${new Date().toISOString()}`;
    const path = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${subFolder}/${fileName}`;
    console.log("path ", path);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "File uploaded successfully!" }),
    };
    // const parsedBody = JSON.parse(event);
    // console.log('body -> ',parsedBody);
    //     const base64File = parsedBody.file;
    //     const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");
    //     const params = {
    //         Bucket: BUCKET_NAME,
    //         Key: `images/${new Date().toISOString()}.jpeg`,
    //         Body: decodedFile,
    //         ContentType: "image/jpeg",
    //     };

    //     const uploadResult = await s3.upload(params).promise();

    //     response.body = JSON.stringify({ message: "Successfully uploaded file to S3", uploadResult });
  } catch (e) {
    console.error(e);
    //     response.body = JSON.stringify({ message: "File failed to upload", errorMessage: e });
    //     response.statusCode = 500;
    return {
      statusCode: 500,

      body: JSON.stringify({
        message: "File failed to upload",
        errorMessage: e,
      }),
    };
  }
};
