const { verifiyOtp } = require("../lib/db");

module.exports.handler = async function sendOtp(event) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty body" }),
    };
  }

  const body = JSON.parse(event.body);

  return await verifiyOtp(body).then((res) => {
    return {
      statusCode: res.statusCode,
      body: JSON.stringify({ message: res.message }),
    };
  });

  // try {
  //   await sendMail(body.mail);
  //   return {
  //     statusCode: 200,
  //     message: "Activation code sent!",
  //   };
  // } catch (error) {
  //   return {
  //     statusCode: 400,
  //     message: "Error while sending Activation code",
  //   };
  // }
};
