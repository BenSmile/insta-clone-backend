const { createDbUser, getUserByEmail } = require("../lib/db");
const { sendMail } = require("../lib/mail");

module.exports.handler = async function registerUser(event) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty body" }),
    };
  }

  const body = JSON.parse(event.body);

  if (!body.email) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Email is required" }),
    };
  }

  const user = await getUserByEmail(body.email);
  console.log("user-> ", user);

  if (user.email) {
    console.log("user exists-> ", user);

    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Account aldready exists" }),
    };
  } else {
    return createDbUser(body)
      .then(async (user) => {
        return {
          statusCode: 200,
          body: JSON.stringify(user),
        };
      })
      .catch((err) => {
        return {
          statusCode: err.statusCode || 500,
          headers: { "Content-Type": "text/plain" },
          body: { stack: err.stack, message: err.message },
        };
      });
  }
};
