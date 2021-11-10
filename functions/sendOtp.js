const {sendSMS}  = require("../lib/sns");

module.exports.handler = async function sendOtp(event) {
  const body = JSON.parse(event.body);
  return sendSMS(body.phoneNumber)
    .then((session) => ({
      statusCode: 200,
      body: JSON.stringify(session),
    }))
    .catch((err) => {
      console.log({ err });

      return {
        statusCode: err.statusCode || 500,
        headers: { "Content-Type": "text/plain" },
        body: { stack: err.stack, message: err.message },
      };
    });
};
