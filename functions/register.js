const { createDbUser, getUserByEmail } = require("../lib/db");

module.exports.handler = async function registerUser(event) {
  const body = JSON.parse(event.body);

  const user = await getUserByEmail(body.email);
  console.log("user-> ", user);

  if (user.email) {
    console.log("user exists-> ", user);

    return {
      statusCode: 200,
      message: "Email already taken",
    };
  } else {
   return createDbUser(body)
      .then((user) => {
        console.log("createUser-- ", user);

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
