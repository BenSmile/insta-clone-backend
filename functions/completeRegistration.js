const { completeRegistration } = require("../lib/db");

module.exports.handler = async function registerUser(event) {
  if (!event.body) {
    return {
      statusCode: 400,
      message: "Empty body",
    };
  }

  const body = JSON.parse(event.body);

  if (!body.password) {
    return {
      statusCode: 400,
      message: "Password is required",
    };
  }

  return completeRegistration(body)
    .then((user) => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Registration completed successfully",
          statusCode: 200,
          user,
        }),
      };
    })
    .catch((err) => {
      console.log({ err });
      return {
        statusCode: err.statusCode || 500,
        headers: { "Content-Type": "text/plain" },
        body: { stack: err.stack, message: err.message },
      };
    });
};
