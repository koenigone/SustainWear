const express = require("express");
const router = express.Router();
const orgController = require("../controllers/orgController");
const { verifyToken } = require("../middlewares/middlewares");

router.get("/my-organisation", verifyToken, orgController.getStaffOrganisation);
router.get("/active", orgController.getActiveOrganisations);
router.get("/:org_id/donation-requests", orgController.getAllDonationRequests);
router.get("/staff/activity", verifyToken, orgController.getStaffActivity);
router.post(
  "/:transaction_id/donation-request-update",
  orgController.updateDontationRequestStatus
);

module.exports = router;
