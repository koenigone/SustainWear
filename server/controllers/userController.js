const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");
const { v4: uuidv4 } = require("uuid");
const {
  validateRegisterInput,
  validateTwoFactorInput,
  validateNameInputs,
  validatePasswordResetInput,
} = require("../helpers/validations");
const {
  sendPasswordResetEmail,
  sendTwoFactorsMail,
} = require("../helpers/emailHelpers");

// REGISTER FUNCTION
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirmPassword } = req.body;

    const validationError = validateRegisterInput(req.body); // validate requested inputs
    if (validationError) return res.status(400).json({ errMessage: validationError });

    const emailQuery = "SELECT 1 FROM USER WHERE email = ?";

    db.get(emailQuery, [email], async (dbErr, row) => {
      if (dbErr) return res.status(500).json({ errMessage: "Database error", error: dbErr.message });

      if (row) return res.status(400).json({ errMessage: "Email is already taken" });

      const hashedPassword = await bcrypt.hash(password, 10);   // hash password
      const registerDate = new Date().toISOString();            // registerDate
      const defaultRole = "Donor";                              // default user role

      const insertQuery = `
        INSERT INTO USER (first_name, last_name, email, password, role, sign_up_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(insertQuery, [first_name, last_name, email, hashedPassword, defaultRole, registerDate],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({
              errMessage: "Database error while creating user",
              error: insertErr.message
            });
          }

          res.status(201).json({
            message: "Account created successfully as Donor",
            userId: this.lastID
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ errMessage: "Internal server error" });
  }
};

const twoFactor = {}; // temp code stored here

// LOGIN FUNCTION
const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ errMessage: "All fields are required" });

    const loginQuery = "SELECT * FROM USER WHERE email = ?";

    db.get(loginQuery, [email], async (error, user) => {
      if (error) return res.status(500).json({ errMessage: "Database error", error: error.message });
      if (!user) return res.status(400).json({ errMessage: "Account does not exist" });
      if (user.is_active === 0) { // check if user account has been deactivated
        return res.status(403).json({
          errMessage:
            "This account has been deactivated. Please contact support or an administrator.",
        });
      }

      // compare hashed passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ errMessage: "Invalid email or password" });

      // generate two factor code (6 digits)
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      const tempToken = uuidv4();
      const expires = Date.now() + 5 * 60 * 1000; // expires after 5 minutes

      twoFactor[tempToken] = { userId: user.user_id, twoFactorCode, expires };

      // send email to user
      await sendTwoFactorsMail(
        user.email,
        "Your 2FA Verification Code",
        `Your verification code is ${twoFactorCode}. It expires in 5 minutes.`
      );

      res.status(200).json({
        message: "2FA code sent to your email",
        tempToken,
      });
    });
  } catch (error) {
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

// VERIFY TWO FACTORS CODE
const verifyTwoFactors = (req, res) => {
  try {
    const { tempToken, code } = req.body;
    const record = twoFactor[tempToken];

    // validate twofactor code
    const validationError = validateTwoFactorInput({ tempToken, code, record });
    if (validationError) return res.status(400).json({ errMessage: validationError });

    const getUserQuery = "SELECT * FROM USER WHERE user_id = ?";

    db.get(getUserQuery, [record.userId], (err, user) => {
      if (err || !user) return res.status(500).json({ errMessage: "User not found" });

      jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role: user.role,
          name: `${user.first_name} ${user.last_name}`,
        },
        jwtSecret,
        { expiresIn: "7d" },
        (err, token) => {
          if (err) return res.status(500).json({ errMessage: "Token error", error: err });

          // cleanup
          delete twoFactor[tempToken];

          res.status(200).json({
            message: "Login successful",
            token,
            user: {
              id: user.user_id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

// RESEND TWO FACTORS CODE
const resendTwoFactors = (req, res) => {
  try {
    const { tempToken } = req.body;
    const record = twoFactor[tempToken];

    if (!record) return res.status(400).json({ errMessage: "Invalid or expired session" });

    if (record.lastResend && Date.now() - record.lastResend < 30 * 1000) {
      return res.status(429).json({ errMessage: "Please wait 30 seconds before requesting another code." });
    }

    record.lastResend = Date.now();

    // generate a new code and update expiry (5 minutes)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    record.twoFactorCode = newCode;
    record.expires = Date.now() + 5 * 60 * 1000;

    // lookup user email
    const getUserQuery = "SELECT email FROM USER WHERE user_id = ?";

    db.get(getUserQuery, [record.userId], async (err, user) => {
      if (err || !user) return res.status(500).json({ errMessage: "User not found" });

      try {
        await transporter.sendMail({
          from: `"SustainWear" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Your new 2FA Verification Code",
          text: `Your new verification code is ${newCode}. It expires in 5 minutes.`,
        });

        return res.status(200).json({ message: "New code sent successfully" });

      } catch (emailErr) {
        return res.status(500).json({
          errMessage: "Failed to send email",
          error: emailErr.message
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

// GET PROFILE FUNCTION
const { getStaffOrganisation } = require("./orgController"); // make sure path is right

// GET PROFILE FUNCTION
const getProfile = (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ errMessage: "Unauthorized" });

  const getProfileQuery =
    "SELECT user_id, first_name, last_name, email, role FROM USER WHERE user_id = ?";

  db.get(getProfileQuery, [userId], (err, user) => {
    if (err) return res.status(500).json({ errMessage: "Database error" });
    if (!user) return res.status(404).json({ errMessage: "User not found" });

    // If user is NOT Staff → return basic user
    if (user.role !== "Staff") {
      return res.status(200).json({
        user: {
          ...user,
          organisation: null,
        },
      });
    }

    // fetch organisation details if user is staff
    getStaffOrganisation(user.user_id, (orgErr, org) => {
      if (orgErr) {
        return res.status(500).json({
          errMessage: "Failed to load organisation details",
        });
      }

      return res.status(200).json({
        user: {
          ...user,
          organisation: org || null,
        },
      });
    });
  });
};

// UPDATE FIRST AND LAST NAME
const updateName = (req, res) => {
  const { first_name, last_name } = req.body;
  const userId = req.user?.id;

  const validationError = validateNameInputs(req.body);
  if (validationError) return res.status(400).json({ errMessage: validationError });

  const query = `UPDATE USER SET first_name = ?, last_name = ? WHERE user_id = ?`;
  db.run(query, [first_name, last_name, userId], (err) => {
    if (err) return res.status(500).json({ errMessage: "Database error", error: err.message });

    res.status(200).json({ message: "Name updated successfully" });
  });
};

// REQUEST CHANGE PASSWORD TOKEN
const requestPasswordChange = async (req, res) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId || !email)
    return res.status(401).json({ errMessage: "Unauthorized request" });

  try {
    await sendPasswordResetEmail(
      email,
      userId,
      process.env.FRONTEND_URL,
      "Change Your Password",
      "Click the link below to change your password (expires in 15 minutes):"
    );

    res.status(200).json({
      message: "Password change link sent to your email",
    });
  } catch (err) {
    res.status(500).json({ errMessage: "Failed to send email" });
  }
};

// FORGOT PASSWORD, SEND RESET LINK TO NOT LOGGED IN USER
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ errMessage: "Email is required" });

  const query = `SELECT user_id FROM USER WHERE email = ?`;

  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ errMessage: "Database error" });
    if (!user) return res.status(404).json({ errMessage: "No account found with this email" });

    try {
      await sendPasswordResetEmail(
        email,
        user.user_id,
        process.env.FRONTEND_URL,
        "Reset Your Password",
        "Click the link below to reset your password (expires in 15 minutes):"
      );

      res.status(200).json({
        message: "Password reset link sent successfully",
      });
    } catch (err) {
      res.status(500).json({ errMessage: "Failed to send reset email" });
    }
  });
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  const validationError = validatePasswordResetInput(req.body);
  if (validationError) return res.status(400).json({ errMessage: validationError });

  try {
    const decoded = jwt.verify(token, jwtSecret); // verify token and extract user id
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run(`UPDATE USER SET password = ? WHERE user_id = ?`, [hashedPassword, decoded.id],
      (err) => {
        if (err) return res.status(500).json({ errMessage: "Failed to update password" });

        res.status(200).json({ message: "Password changed successfully" });
      }
    );
  } catch (err) {
    res.status(400).json({ errMessage: "Invalid or expired token" });
  }
};

// DELETE ACCOUNT
const deleteAccount = (req, res) => {
  const userId = req.user?.id;
  const { password } = req.body;

  db.get(`SELECT password FROM USER WHERE user_id = ?`, [userId], async (err, user) => {
    if (err) res.status(500).json({ errMessage: "Database error", error: err.message });
    if (!user) return res.status(404).json({ errMessage: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ errMessage: "Incorrect password" });

    db.run(`DELETE FROM USER WHERE user_id = ?`, [userId], (err2) => {
      if (err2) res.status(500).json({ errMessage: "Failed to delete account", error: err2.message });

      res.status(200).json({ message: "Account deleted successfully" });
    });
  });
};

// LOGOUT
const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  verifyTwoFactors,
  resendTwoFactors,
  getProfile,
  updateName,
  requestPasswordChange,
  forgotPassword,
  resetPassword,
  deleteAccount,
  logout,
};