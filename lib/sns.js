const AWS = require("aws-sdk");

const SNS = new AWS.SNS();

const sendSMS = async (phoneNumber, otp) => {
  const param = {
    PhoneNumber: phoneNumber,
    Message: `Your OTP is ${otp}`,
  };

  return new Promise((resolve, reject) => {
    SNS.publish(param, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
};

export default sendSMS;
