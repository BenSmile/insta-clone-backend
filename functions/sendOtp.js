const { sendMail } = require("../lib/mail");
const { sendSMS } = require("../lib/sns");

module.exports.handler = async function sendOtp(event) {
  if (!event.body) {
    return {
      statusCode: 204,
      message: "Empty body",
    };
  }
  const body = event.body;
  if (body.mail) {
    try {
      await sendMail(body.mail);
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
  } else if (body.phone) {
    try {
      sendSMS(body.phone);
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
  }
};
