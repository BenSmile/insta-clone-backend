const { generateOTP } = require("./utils");

const AWS = require("aws-sdk");

const SNS = new AWS.SNS();

const sendSMS = async (phoneNumber) => {
  const randomNumber = Math.random();
  const otp = randomNumber * 1000000;
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
