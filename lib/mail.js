"use strict";
const nodemailer = require("nodemailer");

const sendOpt = async (destination, otp) => {
  console.log(`Start sending mail to ${destination}...`);
  let testAccount = await nodemailer.createTestAccount();
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "smilekafirongo@gmail.com", // generated ethereal user
      pass: "bkmwwmjlrfjtwdsw", // generated ethereal password
    },
  });

  console.log("owner -> ", destination, "|", otp);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"VDC Insta 👻" <smilekafirongo@gmail.com>', // sender address
    to: destination, // list of receivers
    subject: "Activation code", // Subject line
    // text: `Your activation code is ${otp}`, // plain text body
    html: `Your activation code is <b>${otp}</b>`, // html body
  });

  console.log(`Mail sent successfully to ${destination}...`);
};

module.exports = {
  sendOpt,
};
