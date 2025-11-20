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
const { sendDonorNotification } = require("../helpers/donorNotifications");

// REGISTER FUNCTION
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirmPassword } = req.body;

    const validationError = validateRegisterInput(req.body);
    if (validationError) {
      return res.status(400).json({ errMessage: validationError });
    }

    const emailQuery = `
      SELECT user_id, is_active, has_received_welcome, deactivation_type
      FROM USER
      WHERE email = ?
    `;

    db.get(emailQuery, [email], async (dbErr, existingUser) => {
      if (dbErr) {
        return res.status(500).json({
          errMessage: "Database error",
          error: dbErr.message,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // case 1 - user exists but is deactivated
      if (existingUser && existingUser.is_active === 0) {

        if (existingUser.deactivation_type === "ADMIN") { // If admin deactivated, block reactivation
          return res.status(403).json({
            errMessage:
              "Your account has been deactivated by an administrator. Please contact support.",
          });
        }

        // only allow reactivation for deactivation_type = SELF
        if (existingUser.deactivation_type === "SELF") {
          const reactivateQuery = `
            UPDATE USER
            SET 
              first_name = ?,
              last_name = ?,
              password = ?,
              is_active = 1,
              deactivation_type = NULL
            WHERE user_id = ?
          `;

          db.run(
            reactivateQuery,
            [first_name, last_name, hashedPassword, existingUser.user_id],
            (updateErr) => {
              if (updateErr) {
                return res.status(500).json({
                  errMessage: "Failed to reactivate account",
                  error: updateErr.message,
                });
              }

              sendDonorNotification( // send welcome back notification
                existingUser.user_id,
                "Welcome back to SustainWear 🌱",
                `Welcome back ${first_name}! Your account has been reactivated.`,
                null
              );

              return res.status(200).json({
                message: "Account reactivated successfully",
                userId: existingUser.user_id,
                reactivated: true,
              });
            }
          );
          return;
        }
      }

      // case 2 user already exists and is active -> Reject
      if (existingUser && existingUser.is_active === 1) {
        return res.status(400).json({
          errMessage: "This email is already associated with an active account",
        });
      }

      // case 3 user does not exist -> create new
      const registerDate = new Date().toISOString();
      const defaultRole = "Donor";

      const insertQuery = "INSERT INTO USER (first_name, last_name, email, password, role, sign_up_date) VALUES (?, ?, ?, ?, ?, ?)";

      db.run(insertQuery, [first_name, last_name, email, hashedPassword, defaultRole, registerDate],
        function (insertErr) {
          if (insertErr) {
            return res.status(500).json({
              errMessage: "Database error while creating user",
              error: insertErr.message,
            });
          }

          const newUserId = this.lastID;

          sendDonorNotification(
            newUserId,
            "Welcome to SustainWear 🌱",
            `Welcome ${first_name}! We're glad to have you onboard.`,
            null
          );

          db.run(
            `UPDATE USER SET has_received_welcome = 1 WHERE user_id = ?`,
            [newUserId]
          );

          res.status(201).json({
            message: "Account created successfully as Donor",
            userId: newUserId,
            reactivated: false,
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

    const loginQuery = `
      SELECT user_id, email, password, role, is_active, deactivation_type, first_name, last_name
      FROM USER
      WHERE email = ?
    `;

    db.get(loginQuery, [email], async (error, user) => {
      if (error) {
        return res.status(500).json({
          errMessage: "Database error",
          error: error.message,
        });
      }

      if (!user) {
        return res.status(400).json({ errMessage: "Account does not exist" });
      }

      // account deactivated
      if (user.is_active === 0) {

        if (user.deactivation_type === "ADMIN") { // deactivated by ADMIN
          return res.status(403).json({
            errMessage:
              "Your account has been deactivated by an administrator. Please contact support.",
          });
        }

        if (user.deactivation_type === "SELF") { // deactivated by SELF
          return res.status(403).json({
            errMessage:
              "Your account is currently deactivated. You can reactivate it by registering again.",
          });
        }

        return res.status(403).json({ // fallback
          errMessage: "This account is currently deactivated.",
        });
      }

      // password check
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errMessage: "Invalid email or password" });
      }

      // generate 2FA code
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      const tempToken = uuidv4();
      const expires = Date.now() + 5 * 60 * 1000;

      twoFactor[tempToken] = {
        userId: user.user_id,
        twoFactorCode,
        expires,
      };

      await sendTwoFactorsMail( // send 2FA email
        user.email,
        "Your 2FA Verification Code",
        `Your verification code is ${twoFactorCode}. It expires in 5 minutes.`
      );

      return res.status(200).json({
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
const deactivateAccount = (req, res) => {
  const userId = req.user?.id;
  const { password } = req.body;

  if (!userId) return res.status(401).json({ errMessage: "Unauthorized" });
  if (!password) return res.status(400).json({ errMessage: "Password is required" });

  db.get(`SELECT password, is_active FROM USER WHERE user_id = ?`, // fetch user password hash
    [userId],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          errMessage: "Database error",
          error: err.message,
        });
      }

      if (!user) return res.status(404).json({ errMessage: "User not found" });
      if (user.is_active === 0) return res.status(400).json({ errMessage: "Account already deactivated" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ errMessage: "Incorrect password" });

      // deactivate account and set deactivation_type to SELF
      db.run("UPDATE USER SET is_active = 0, deactivation_type = 'SELF' WHERE user_id = ?;",
        [userId],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({
              errMessage: "Failed to deactivate account",
              error: updateErr.message,
            });
          }

          return res.status(200).json({
            message: "Account deactivated successfully",
          });
        }
      );
    }
  );
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
  deactivateAccount,
  logout,
};