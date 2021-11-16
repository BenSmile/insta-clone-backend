const { getAllUsers } = require("../lib/db");

module.exports.handler = async function (event) {
  const dbUser = await getAllUsers();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(dbUser),
  };
};
