const express = require("express");
const router = express.Router();
const cors = require("cors");
const userController = require("../controllers/userController");

// middleware
router.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/register", userController.Register);
router.post("/login", userController.Login);
router.post("/verifyTwoFactors", userController.VerifyTwoFactors);
router.post("/resendTwoFactors", userController.ResendTwoFactors);
router.get("/profile", userController.getProfile);
router.post("/logout", userController.Logout);

module.exports = router;