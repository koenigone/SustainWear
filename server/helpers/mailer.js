const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, message) => {
  try {
    await transporter.sendMail({
      from: `"SustainWear" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial; padding: 14px;">
          <h2 style="color: #2F855A">${subject}</h2>
          <p>${message}</p>
          <hr />
          <small>This is an automated email from SustainWear.</small>
        </div>
      `,
    });
  } catch (err) {
    console.log("Email error:", err.message);
  }
}

module.exports = { sendEmail };