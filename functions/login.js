const { login } = require("../lib/utils");

module.exports.handler = async function signInUser(event) {
  console.log("body-> ", event.body);
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty body" }),
    };
  }

  const body = JSON.parse(event.body);

  if (!body.email || !body.password) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Email and password are required" }),
    };
  }

  return login(body)
    .then((session) => ({
      statusCode: 200,
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
