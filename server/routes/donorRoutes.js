const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const { verifyToken, upload } = require("../middlewares/middlewares");

router.post(
  "/donations/request",
  verifyToken,
  upload.single("photo"),
  donorController.submitDonationRequest
);

// notification routes
router.get("/notifications", verifyToken, donorController.getDonorNotifications);
router.put("/notifications/:notification_id/read", verifyToken, donorController.markNotificationRead);
router.put("/notifications/read-all", verifyToken, donorController.markAllRead);

module.exports = router;