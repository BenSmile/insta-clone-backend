const { sendOtpToClient } = require("../lib/db");
const { login } = require("../lib/utils");

module.exports.handler = async function signInUser(event) {
  // console.log("body-> ", event.body);
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty body", statusCode: 400 }),
    };
  }

  const body = JSON.parse(event.body);

  if (!body.email || !body.password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Email and password are required",
        statusCode: 400,
      }),
    };
  }

  return login(body)
    .then((session) => ({
      statusCode: session.statusCode,
      body: JSON.stringify(session),
    }))
    .catch((err) => {
      console.log({ err });

      return {
        statusCode: err.statusCode || 500,
        headers: { "Content-Type": "text/plain" },
        body: { stack: err.stack, message: err.message, statusCode: 500 },
      };
    });
};

module.exports.sendOtp = async function (event) {
  try {
    const email = event.pathParameters.email;

    await sendOtpToClient(email);

    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: "Code sent successfully" }),
    };
  } catch (error) {
    console.log(error);
  }
};
