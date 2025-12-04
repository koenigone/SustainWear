const express = require("express");
const router = express.Router();
const orgController = require("../controllers/orgController");
const { verifyToken } = require("../middlewares/middlewares");

router.get("/my-organisation", verifyToken, orgController.getStaffOrganisation);
router.get("/active", orgController.getActiveOrganisations);
router.get("/:org_id/donation-requests", orgController.getAllDonationRequests);
router.post(
  "/:transaction_id/donation-request-update",
  orgController.updateDonationRequestStatus
);

// org metrics
router.get(
  "/:org_id/metrics",
  verifyToken,
  orgController.getOrganisationMetrics
);

// inventory routes
router.get("/:org_id/inventory", verifyToken, orgController.getInventoryItems);
router.get(
  "/:org_id/inventory/:inv_id",
  verifyToken,
  orgController.getInventoryItemById
);
router.delete(
  "/:org_id/inventory/:inv_id",
  verifyToken,
  orgController.removeInventoryItem
);

// distribution routes
router.post(
  "/:org_id/distribute/:inv_id",
  verifyToken,
  orgController.distributeInventoryItem
);
router.get(
  "/:org_id/distribution-records",
  verifyToken,
  orgController.getDistributionRecords
);

module.exports = router;
