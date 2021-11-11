const AWS = require("aws-sdk");

const SNS = new AWS.SNS();

const sendSMS = async (phoneNumber) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const param = {
    PhoneNumber: phoneNumber,
    Message: `Your OTP is ${otp}`,
  };

  return new Promise((resolve, reject) => {
    SNS.publish(param, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
};

module.exports = { sendSMS };
