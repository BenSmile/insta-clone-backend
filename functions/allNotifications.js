const { getAllNotifications } = require("../lib/db");

module.exports.handler = async function (event) {
  const dbUser = await getAllNotifications();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(dbUser),
  };
};
