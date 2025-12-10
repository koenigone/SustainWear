const express = require("express");
const router = express.Router();
const donorController = require("../controllers/donorController");
const { verifyToken, upload } = require("../middlewares/middlewares");

// submit a donation
router.post("/donations/request", verifyToken, upload.array("photos", 4), donorController.submitDonationRequest);

// notification routes
router.get("/notifications", verifyToken, donorController.getDonorNotifications);
router.put("/notifications/:notification_id/read", verifyToken, donorController.markNotificationRead);
router.put("/notifications/read-all", verifyToken, donorController.markAllRead);
router.post("/generate-description", verifyToken, donorController.generateDonationDescription);

// donation history route
router.get("/donations/history", verifyToken, donorController.getDonationHistory);

// metrics
router.get("/dashboard/summary", verifyToken, donorController.getDonorSummary);
router.get("/dashboard/status", verifyToken, donorController.getDonationStatusBreakdown);
router.get("/dashboard/categories", verifyToken, donorController.getDonationCategoryBreakdown);
router.get("/dashboard/monthly-impact", verifyToken, donorController.getMonthlyImpact);
router.get("/dashboard/recent-activity", verifyToken, donorController.getRecentActivity);
router.get("/dashboard/leaderboard", verifyToken, donorController.getDonorLeaderboard);

module.exports = router;