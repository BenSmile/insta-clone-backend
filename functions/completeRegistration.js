const { completeRegistration } = require("../lib/db");

module.exports.handler = async function registerUser(event) {
  const body = JSON.parse(event.body);

  return completeRegistration(body)
    .then((user) => {
      return {
        statusCode: 200,
        body: JSON.stringify(user),
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