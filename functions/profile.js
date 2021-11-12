const { getUserByEmail, updateDbUser } = require("../lib/db");
const { getUserFromToken } = require("../lib/utils");

module.exports.handler = async function (event) {
  const userObj = await getUserFromToken(event.headers.Authorization);

  const dbUser = await getUserByEmail(userObj.email);

  if (!dbUser) {
    return {
      statusCode: 403,
      message: "Not authorized",
    };
  }
  const body = event.body;

  const updatedUser = await updateDbUser(body, body.id);

  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(updatedUser),
  };
};
