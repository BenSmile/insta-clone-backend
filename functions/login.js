const { login } = require("../lib/utils");

module.exports.handler = async function signInUser(event) {
  if(!event.body){
    return {
      statusCode: 204,
      message: "Empty body",
    };
  }
  
  const body = JSON.parse(event.body);

  return login(body)
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session)
    }))
    .catch(err => {
      console.log({ err });

      return {
        statusCode: err.statusCode || 500,
        headers: { "Content-Type": "text/plain" },
        body: { stack: err.stack, message: err.message }
      };
    });
};
