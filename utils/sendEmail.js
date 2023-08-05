const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOpts = {
      from: "shoppy App <mazen.mezoo20189@gmail.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    await transporter.sendMail(mailOpts);
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendEmail;
