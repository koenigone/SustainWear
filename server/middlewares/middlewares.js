const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt");
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// VERIFY USER TOKEN
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ errMessage: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);

    const checkUserQuery = "SELECT is_active FROM USER WHERE user_id = ?";
    db.get(checkUserQuery, [decoded.id], (err, user) => {
      if (err) {
        return res.status(500).json({ errMessage: "Database error" });
      }
      if (!user || user.is_active === 0) {
        return res.status(403).json({
          errMessage: "Your account has been deactivated. Please contact support.",
        });
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.status(403).json({ errMessage: "Invalid or expired token" });
  }
}

// VERIFY ADMIN ROLE (ONLY ADMIN CAN DO ADMIN ACTIONS)
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ errMessage: "Access denied. Admins only." });
  }
  next();
}

// VEIRFY TEMP RESET PASSWORD TOKEN
const verifyResetToken = (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, jwtSecret);
    res.status(200).json({ valid: true, userId: decoded.id });
  } catch (err) {
    res.status(400).json({ errMessage: "Invalid or expired token" });
  }
}

// Allowed file types
const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/donations/"); // Make sure folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPG, JPEG, and PNG allowed."));
  }
  cb(null, true);
};

// Max file: 2MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});


module.exports = { 
  verifyToken,
  verifyAdmin,
  verifyResetToken,
  upload,
};