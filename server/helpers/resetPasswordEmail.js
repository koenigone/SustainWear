const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");
const transporter = require("../config/mailer");

// SEND PASSWORD RESET EMAIL TO SPECIFIED USER
const sendPasswordResetEmail = async (email, userId, frontendUrl, subject, message, res) => {
  try {
    const token = jwt.sign({ id: userId }, jwtSecret, { expiresIn: "15m" });
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"SustainWear" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: `${message}\n\n${resetLink}`,
    });

    return { success: true, resetLink };
  } catch (error) {
    console.error("Email send error:", error);
    if (res)
      return res.status(500).json({ errMessage: "Failed to send email" });
    throw error;
  }
}

// SEND TWO FACTOR AUTHENTICATION EMAIL
const sendTwoFactorsMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"SustainWear" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email sending failed");
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendTwoFactorsMail,
};