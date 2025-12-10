const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");
const { v4: uuidv4 } = require("uuid");

const {
  USER_ERROR_CODES,
  USER_ERROR_MESSAGES,
  USER_SUCCESS_CODES,
  USER_SUCCESS_MESSAGES,
  GENERAL_ERROR_CODES,
  GENERAL_ERROR_MESSAGES,
} = require("../messages/errorMessages");

const {
  validateRegisterInput,
  validateTwoFactorInput,
  validateNameInputs,
  validatePasswordResetInput,
} = require("../helpers/inputValidations");

const {
  sendPasswordResetEmail,
  sendTwoFactorsMail,
} = require("../helpers/resetPasswordEmail");

const { sendDonorNotification } = require("../helpers/donorNotifications");
const { getStaffOrganisation } = require("./orgController"); // to show staff's org info on login
const twoFactor = {}; // store 2FA code in memory

// --------------------------------------------------------
// REGISTER
// --------------------------------------------------------
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirmPassword } = req.body;

    const validationError = validateRegisterInput(req.body);
    if (validationError) return res.status(400).json(validationError);

    const emailQuery = `
      SELECT user_id, is_active, has_received_welcome, deactivation_type
      FROM USER
      WHERE email = ?
    `;

    db.get(emailQuery, [email], async (dbErr, existingUser) => {
      if (dbErr) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: dbErr.message,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // 1- user exists but deactivated
      if (existingUser && existingUser.is_active === 0) {
        if (existingUser.deactivation_type === "ADMIN") {
          return res.status(403).json({
            code: USER_ERROR_CODES.ACCOUNT_DEACTIVATED_ADMIN,
            message: USER_ERROR_MESSAGES.USER_ACCOUNT_DEACTIVATED_ADMIN,
          });
        }

        if (existingUser.deactivation_type === "SELF") {
          const reactivateQuery = `
            UPDATE USER SET 
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
                  code: GENERAL_ERROR_CODES.DATABASE_ERROR,
                  message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
                  error: updateErr.message,
                });
              }

              sendDonorNotification(
                existingUser.user_id,
                "Welcome back to SustainWear 🌱",
                `Welcome back ${first_name}! Your account has been reactivated.`,
                null
              );

              return res.status(200).json({
                code: USER_SUCCESS_CODES.REGISTER_SUCCESS,
                message: USER_SUCCESS_MESSAGES.USER_REGISTER_SUCCESS,
                reactivated: true,
                user_id: existingUser.user_id,
              });
            }
          );
          return;
        }
      }

      // 2- eser exists and active
      if (existingUser && existingUser.is_active === 1) {
        return res.status(400).json({
          code: USER_ERROR_CODES.ALREADY_EXISTS,
          message: USER_ERROR_MESSAGES.USER_ALREADY_EXISTS,
        });
      }

      // 3- new user registration
      const registerDate = new Date().toISOString();
      const defaultRole = "Donor";

      const insertUserQuery = `
        INSERT INTO USER (first_name, last_name, email, password, role, sign_up_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(
        insertUserQuery,
        [
          first_name,
          last_name,
          email,
          hashedPassword,
          defaultRole,
          registerDate,
        ],
        function (insertErr) {
          if (insertErr) {
            return res.status(500).json({
              code: GENERAL_ERROR_CODES.DATABASE_ERROR,
              message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
              error: insertErr.message,
            });
          }

          const newUserId = this.lastID;

          sendDonorNotification( // send in app notification upon registering
            newUserId,
            "Welcome to SustainWear 🌱",
            `Welcome ${first_name}! We're glad to have you onboard.`,
            null
          );

          db.run(`UPDATE USER SET has_received_welcome = 1 WHERE user_id = ?`, [
            newUserId,
          ]);

          return res.status(201).json({
            code: USER_SUCCESS_CODES.REGISTER_SUCCESS,
            message: USER_SUCCESS_MESSAGES.USER_REGISTER_SUCCESS,
            user_id: newUserId,
            reactivated: false,
          });
        }
      );
    });
  } catch (err) {
    return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
    });
  }
};

// --------------------------------------------------------
// LOGIN → ENTER PASSWORD, THEN SEND 2FA CODE
// --------------------------------------------------------
const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: USER_ERROR_CODES.ALL_FIELDS_REQUIRED,
        message: USER_ERROR_MESSAGES.USER_ALL_FIELDS_REQUIRED,
      });
    }

    const loginQuery = `
      SELECT user_id, email, password, role, is_active, deactivation_type, first_name, last_name
      FROM USER
      WHERE email = ?
    `;

    db.get(loginQuery, [email], async (error, user) => {
      if (error) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: error.message,
        });
      }

      if (!user) {
        return res.status(404).json({
          code: USER_ERROR_CODES.NOT_FOUND,
          message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      // deactivated users
      if (user.is_active === 0) {
        if (user.deactivation_type === "ADMIN") {
          return res.status(403).json({
            code: USER_ERROR_CODES.ACCOUNT_DEACTIVATED_ADMIN,
            message: USER_ERROR_MESSAGES.USER_ACCOUNT_DEACTIVATED_ADMIN,
          });
        }

        if (user.deactivation_type === "SELF") {
          return res.status(403).json({
            code: USER_ERROR_CODES.ACCOUNT_DEACTIVATED_SELF,
            message: USER_ERROR_MESSAGES.USER_ACCOUNT_DEACTIVATED_SELF,
          });
        }

        return res.status(403).json({
          code: USER_ERROR_CODES.ACCOUNT_DEACTIVATED,
          message: USER_ERROR_MESSAGES.USER_ACCOUNT_DEACTIVATED,
        });
      }

      // password check
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          code: USER_ERROR_CODES.INVALID_CREDENTIALS,
          message: USER_ERROR_MESSAGES.USER_INVALID_CREDENTIALS,
        });
      }

      // generate 2FA code
      const twoFactorCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const tempToken = uuidv4();
      const expires = Date.now() + 5 * 60 * 1000;

      twoFactor[tempToken] = {
        userId: user.user_id,
        twoFactorCode,
        expires,
      };

      await sendTwoFactorsMail( // send email with 2fa code
        user.email,
        "Your 2FA Verification Code",
        `Your verification code is ${twoFactorCode}. It expires in 5 minutes.`
      );

      return res.status(200).json({
        message: "2FA code sent",
        tempToken,
      });
    });
  } catch (err) {
    return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
    });
  }
};

// --------------------------------------------------------
// VERIFY 2FA
// --------------------------------------------------------
const verifyTwoFactors = (req, res) => {
  try {
    const { tempToken, code } = req.body;
    const record = twoFactor[tempToken];

    const validationError = validateTwoFactorInput({ tempToken, code, record });
    if (validationError) return res.status(400).json(validationError);

    const getUserQuery = `SELECT * FROM USER WHERE user_id = ?`;

    db.get(getUserQuery, [record.userId], (err, user) => {
      if (err || !user) {
        return res.status(500).json({
          code: USER_ERROR_CODES.NOT_FOUND,
          message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role: user.role,
          name: `${user.first_name} ${user.last_name}`,
        },
        jwtSecret,
        { expiresIn: "7d" },
        (jwtErr, token) => {
          if (jwtErr) {
            return res.status(500).json({
              code: USER_ERROR_CODES.TOKEN_ERROR,
              message: USER_ERROR_MESSAGES.USER_TOKEN_ERROR,
              error: jwtErr.message,
            });
          }

          delete twoFactor[tempToken];

          return res.status(200).json({ // login user after verifying 2fa
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
  } catch (err) {
    return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
    });
  }
};

// --------------------------------------------------------
// RESEND 2FA CODE
// --------------------------------------------------------
const resendTwoFactors = (req, res) => {
  try {
    const { tempToken } = req.body;
    const record = twoFactor[tempToken];

    if (!record) {
      return res.status(400).json({
        code: USER_ERROR_CODES.INVALID_2FA_SESSION,
        message: USER_ERROR_MESSAGES.USER_INVALID_2FA_SESSION,
      });
    }

    if (record.lastResend && Date.now() - record.lastResend < 30 * 1000) {
      return res.status(429).json({
        code: USER_ERROR_CODES.TWO_FACTOR_RATE_LIMIT,
        message: USER_ERROR_MESSAGES.USER_2FA_RATE_LIMIT,
      });
    }

    record.lastResend = Date.now();

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    record.twoFactorCode = newCode;
    record.expires = Date.now() + 5 * 60 * 1000;

    const getUserQuery = `SELECT email FROM USER WHERE user_id = ?`;

    db.get(getUserQuery, [record.userId], async (err, user) => {
      if (err || !user) {
        return res.status(500).json({
          code: USER_ERROR_CODES.NOT_FOUND,
          message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      await sendTwoFactorsMail( // send new 2fa via email
        user.email,
        "Your new verification code",
        `Your new verification code is ${newCode}. It expires in 5 minutes.`
      );

      return res.status(200).json({
        message: "New code sent successfully",
      });
    });
  } catch (err) {
    return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
    });
  }
};

// --------------------------------------------------------
// GET PROFILE
// --------------------------------------------------------
const getProfile = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      code: GENERAL_ERROR_CODES.UNAUTHORIZED,
      message: GENERAL_ERROR_MESSAGES.UNAUTHORIZED,
    });
  }

  const getUserProfileQuery = `
    SELECT user_id, first_name, last_name, email, role 
    FROM USER 
    WHERE user_id = ?
  `;

  db.get(getUserProfileQuery, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      });
    }

    if (!user) {
      return res.status(404).json({
        code: USER_ERROR_CODES.NOT_FOUND,
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    if (user.role !== "Staff") {
      return res.status(200).json({ user: { ...user, organisation: null } });
    }

    getStaffOrganisation(user.user_id, (orgErr, org) => {
      if (orgErr) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
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

// --------------------------------------------------------
// UPDATE NAME
// --------------------------------------------------------
const updateName = (req, res) => {
  const userId = req.user?.id;
  const validationError = validateNameInputs(req.body);

  if (validationError) return res.status(400).json(validationError);

  const { first_name, last_name } = req.body;

  const updateNameQuery = `UPDATE USER SET first_name = ?, last_name = ? WHERE user_id = ?`;

  db.run(updateNameQuery, [first_name, last_name, userId], (err) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }

    return res.status(200).json({
      code: USER_SUCCESS_CODES.PROFILE_UPDATED,
      message: USER_SUCCESS_MESSAGES.USER_PROFILE_UPDATED,
    });
  });
};

// --------------------------------------------------------
// SEND PASSWORD CHANGE LINK (AUTHENTICATED USER)
// --------------------------------------------------------
const requestPasswordChange = async (req, res) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId || !email) {
    return res.status(401).json({
      code: GENERAL_ERROR_CODES.UNAUTHORIZED,
      message: GENERAL_ERROR_MESSAGES.UNAUTHORIZED,
    });
  }

  try {
    await sendPasswordResetEmail(
      email,
      userId,
      process.env.FRONTEND_URL,
      "Change Your Password",
      "Click the link to change your password (expires in 15 minutes):"
    );

    return res.status(200).json({
      code: USER_SUCCESS_CODES.PASSWORD_RESET_SUCCESS,
      message: USER_SUCCESS_MESSAGES.USER_PASSWORD_RESET_SUCCESS,
    });
  } catch (err) {
    return res.status(500).json({
      code: USER_ERROR_CODES.EMAIL_SEND_FAILED,
      message: USER_ERROR_MESSAGES.USER_EMAIL_SEND_FAILED,
      error: err.message,
    });
  }
};

// --------------------------------------------------------
// SEND FORGOT PASSWORD LINK (PUBLIC)
// --------------------------------------------------------
const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      code: USER_ERROR_CODES.INVALID_EMAIL,
      message: USER_ERROR_MESSAGES.USER_INVALID_EMAIL,
    });
  }

  const findUserByEmailQuery = `SELECT user_id FROM USER WHERE email = ?`;

  db.get(findUserByEmailQuery, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      });
    }

    if (!user) {
      return res.status(404).json({
        code: USER_ERROR_CODES.NOT_FOUND,
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    try {
      await sendPasswordResetEmail( // send reset password link to email
        email,
        user.user_id,
        process.env.FRONTEND_URL,
        "Reset Your Password",
        "Click the link to reset your password (expires in 15 minutes):"
      );

      return res.status(200).json({
        code: USER_SUCCESS_CODES.PASSWORD_RESET_SUCCESS,
        message: USER_SUCCESS_MESSAGES.USER_PASSWORD_RESET_SUCCESS,
      });
    } catch (err) {
      return res.status(500).json({
        code: USER_ERROR_CODES.EMAIL_SEND_FAILED,
        message: USER_ERROR_MESSAGES.USER_EMAIL_SEND_FAILED,
        error: err.message,
      });
    }
  });
};

// --------------------------------------------------------
// RESET PASSWORD
// --------------------------------------------------------
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  const validationError = validatePasswordResetInput(req.body);
  if (validationError) return res.status(400).json(validationError);

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const hashed = await bcrypt.hash(newPassword, 10);

    const updatePassQuery = "UPDATE USER SET password = ? WHERE user_id = ?";
    db.run(updatePassQuery, [hashed, decoded.id],
      (err) => {
        if (err) {
          return res.status(500).json({
            code: GENERAL_ERROR_CODES.DATABASE_ERROR,
            message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          });
        }

        return res.status(200).json({
          code: USER_SUCCESS_CODES.PASSWORD_RESET_SUCCESS,
          message: USER_SUCCESS_MESSAGES.USER_PASSWORD_RESET_SUCCESS,
        });
      }
    );
  } catch (err) {
    return res.status(400).json({
      code: USER_ERROR_CODES.RESET_TOKEN_INVALID,
      message: USER_ERROR_MESSAGES.USER_RESET_TOKEN_INVALID,
    });
  }
};

// --------------------------------------------------------
// DEACTIVATE ACCOUNT
// --------------------------------------------------------
const deactivateAccount = (req, res) => {
  const userId = req.user?.id;
  const { password } = req.body;

  if (!userId) {
    return res.status(401).json({
      code: GENERAL_ERROR_CODES.UNAUTHORIZED,
      message: GENERAL_ERROR_MESSAGES.UNAUTHORIZED,
    });
  }

  if (!password) {
    return res.status(400).json({
      code: USER_ERROR_CODES.PASSWORD_REQUIRED,
      message: USER_ERROR_MESSAGES.USER_PASSWORD_REQUIRED,
    });
  }

  const confirmByPassQuery = "SELECT password, is_active FROM USER WHERE user_id = ?";

  db.get(confirmByPassQuery, [userId], async (err, user) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      });
    }

    if (!user) {
      return res.status(404).json({
        code: USER_ERROR_CODES.NOT_FOUND,
        message: USER_ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    if (user.is_active === 0) {
      return res.status(400).json({
        code: USER_ERROR_CODES.ACCOUNT_ALREADY_DEACTIVATED,
        message: USER_ERROR_MESSAGES.USER_ACCOUNT_ALREADY_DEACTIVATED,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        code: USER_ERROR_CODES.INCORRECT_PASSWORD,
        message: USER_ERROR_MESSAGES.USER_INCORRECT_PASSWORD,
      });
    }

    const deactivateAccQuery = "UPDATE USER SET is_active = 0, deactivation_type = 'SELF' WHERE user_id = ?";
    db.run(deactivateAccQuery, [userId],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            code: GENERAL_ERROR_CODES.DATABASE_ERROR,
            message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          });
        }

        return res.status(200).json({
          code: USER_SUCCESS_CODES.ACCOUNT_DEACTIVATED,
          message: USER_SUCCESS_MESSAGES.USER_ACCOUNT_DEACTIVATED,
        });
      }
    );
  });
};

// LOGOUT AND END TOKEN
const logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    code: USER_SUCCESS_CODES.LOGOUT_SUCCESS,
    message: USER_SUCCESS_MESSAGES.USER_LOGOUT_SUCCESS,
  });
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