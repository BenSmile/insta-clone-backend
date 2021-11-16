const { getAllUsers , getAllOtps} = require("../lib/db");

module.exports.handler = async function (event) {
  const dbUser = await getAllUsers();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(dbUser),
  };
};


module.exports.getOtps = async function (event) {
  const otps = await getAllOtps();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify(otps),
  };
};
