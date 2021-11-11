const { sendMail } = require("../lib/mail");

module.exports.handler = async function sendOtp(event) {
  if (!event.body) {
    return {
      statusCode: 204,
      message: "Empty body",
    };
  }

  const body = JSON.parse(event.body);

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
};
