const AWS = require("aws-sdk");
const {v4: uuidv4} = require("uuid");
const s3 = new AWS.S3();
const { createPost } = require("../lib/db");
const { updloadonS3 } = require("./uploadS3");

const BUCKET_NAME = "serverless-jwt-authorizer-bucket-dev";
const AWS_REGION = process.env.AWS_REGION;
const subFolder = "data";

module.exports.handler = async (event) => {
    console.log(event);

    const response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({message: "Successfully uploaded file to S3"}),
    };

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
        const userObj = await getUserFromToken(event.headers.Authorization);



        const parsedBody = JSON.parse(event.body);
        console.log('caption -> ', parsedBody.caption);
        const base64File = parsedBody.file;
        const imgPath = await updloadonS3(base64File);
        console.log('---> ', imgPath);
        const post = {
            caption: parsedBody.caption,
            title: 'a title',
            medias: [imgPath],
        };

        await createPost(post, userObj.email);

        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify({ message: "Post create successfully" }),
        };

        // response.body = JSON.stringify({message: "Successfully uploaded file to S3", uploadResult});
    } catch (e) {
        console.error(e);
        response.body = JSON.stringify({message: "File failed to upload", errorMessage: e});
        response.statusCode = 500;
    }

    return response;
};
