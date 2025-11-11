const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyResetToken } = require("../middlewares/middlewares");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/verifyTwoFactors", userController.verifyTwoFactors);
router.post("/resendTwoFactors", userController.resendTwoFactors);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword", userController.resetPassword);

// verify temp token for password reset
router.get("/verifyResetToken/:token", verifyResetToken);

// protected routes (require valid token)
router.get("/profile", verifyToken, userController.getProfile);
router.post("/logout", verifyToken, userController.logout);
router.put("/updateName", verifyToken, userController.updateName);
router.delete("/deleteAccount", verifyToken, userController.deleteAccount);
router.post("/requestPasswordChange", verifyToken, userController.requestPasswordChange);

module.exports = router;