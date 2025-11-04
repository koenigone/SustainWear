const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// SIGN UP FUNCTION
const Register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirmPassword, role } = req.body;
    console.log("Register request body:", req.body);

    if (!first_name || !last_name || !email || !password || !confirmPassword || !role) { // check if all fields are filled
      return res.status(400).json({ errMessage: "All fields are required" });
    }

    const emailQuery = "SELECT * FROM user WHERE email = ?"; // make sure email is unique
    db.get(emailQuery, [email], async (error, row) => {
      if (error) {
        console.error("Email check error:", error);
        return res.status(500).json({ errMessage: "Database error", error });
      }

      if (row) return res.status(400).json({ errMessage: "Email is already taken" });

      if (password !== confirmPassword) // compare password & confirmPassword
        return res.status(400).json({ errMessage: "Passwords do not match." });

      // hash password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
      const signupDate = new Date().toISOString();

      const insertQuery = `
        INSERT INTO user (first_name, last_name, email, password, role, sign_up_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(insertQuery, [first_name, last_name, email, hashedPassword, role, signupDate], function (err) {
        if (err) {
          console.error("Insert error:", err);
          return res.status(500).json({ errMessage: "Database error", error: err.message });
        }

        res.status(201).json({ message: "Account created successfully", userId: this.lastID });
      });
    });
  } catch (err) {
    console.error("Register exception:", err);
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twoFactor = {};

// LOGIN FUNCTION
const Login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) { // make sure fields are filled
      return res.status(400).json({ errMessage: "All fields are required" });
    }

    const loginQuery = "SELECT * FROM USER WHERE email = ?";
    db.get(loginQuery, [email], async (error, user) => {
      if (error) {
        return res
          .status(500)
          .json({ errMessage: "Database error", error: error.message });
      }

      if (!user) {
        return res
          .status(400)
          .json({ errMessage: "Account does not exist" });
      }

      // compare hashed passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errMessage: "Invalid email or password" });
      }

      // generate two factor code (6 digits)
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      const tempToken = uuidv4();
      const expires = Date.now() + 5 * 60 * 1000; // expires after 5 minutes

      twoFactor[tempToken] = { userId: user.user_id, twoFactorCode, expires };

      // send email to user
      await transporter.sendMail({
        from: `"SustainWear" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Your 2FA Verification Code",
        text: `Your verification code is ${twoFactorCode}. It expires in 5 minutes.`,
      });

      console.log(`2FA code for ${user.email}: ${twoFactorCode}`);

      res.status(200).json({
        message: "2FA code sent to your email",
        tempToken,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

// VERIFY TWO FACTORS CODE
const VerifyTwoFactors = (req, res) => {
  try {
    const { tempToken, code } = req.body;
    const record = twoFactor[tempToken];

    if (!record)
      return res.status(400).json({ errMessage: "Invalid or expired session" });

    if (Date.now() > record.expires)
      return res.status(400).json({ errMessage: "Code expired" });

    if (record.twoFactorCode !== code)
      return res.status(400).json({ errMessage: "Incorrect code" });

    const getUserQuery = "SELECT * FROM USER WHERE user_id = ?";
    db.get(getUserQuery, [record.userId], (err, user) => {
      if (err || !user)
        return res.status(500).json({ errMessage: "User not found" });

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
          if (err)
            return res.status(500).json({ errMessage: "Token error", error: err });

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
    console.error("Verify Two Factors error:", error);
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

// RESEND TWO FACTORS CODE
const ResendTwoFactors = (req, res) => {
  try {
    const { tempToken } = req.body;
    const record = twoFactor[tempToken];

    if (!record) {
      return res.status(400).json({ errMessage: "Invalid or expired session" });
    }

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
      if (err || !user) {
        return res.status(500).json({ errMessage: "User not found" });
      }

      try {
        await transporter.sendMail({
          from: `"SustainWear" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Your new 2FA Verification Code",
          text: `Your new verification code is ${newCode}. It expires in 5 minutes.`,
        });

        console.log(`Resent 2FA code to ${user.email}: ${newCode}`);

        return res.status(200).json({ message: "New code sent successfully" });
      } catch (emailErr) {
        console.error(emailErr);
        return res
          .status(500)
          .json({ errMessage: "Failed to send email", error: emailErr.message });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

// GET PROFILE FUNCTION
const getProfile = (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ errMessage: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, jwtSecret, {}, (err, decoded) => {
      if (err) return res.status(401).json({ errMessage: "Invalid token" });

      const getProfileQuery = "SELECT * FROM USER WHERE user_id = ?";
      db.get(getProfileQuery, [decoded.id], (err, user) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ errMessage: "Database error" });
        }

        if (!user) {
          return res.status(404).json({ errMessage: "User not found" });
        }

        res.status(200).json({
          user: {
            id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
          },
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errMessage: "Internal server error" });
  }
};

// LOGOUT
const Logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  Register,
  Login,
  VerifyTwoFactors,
  ResendTwoFactors,
  getProfile,
  Logout,
};