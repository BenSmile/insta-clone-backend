const { default: sendMail } = require("../lib/mail");
const { sendSMS } = require("../lib/sns");

module.exports.handler = async function sendOtp(event) {
  const body = JSON.parse(event.body);

  try {
    sendMail(body.mail);
    return {
      statusCode: 200,
      message: "Activation code sent!",
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Error while sending Activation code",
    };
  }

  // return sendSMS(body.phoneNumber)
  //   .then((session) => ({
  //     statusCode: 200,
  //     body: JSON.stringify(session),
  //   }))
  //   .catch((err) => {
  //     return {
  //       statusCode: err.statusCode || 500,
  //       headers: { "Content-Type": "application/json" },
  //       body: { stack: err.stack, message: err.message },
  //     };
  //   });
};
