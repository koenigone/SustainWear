const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { verifyToken } = require('../middlewares/middlewares');

router.get("/my-organisation", verifyToken, orgController.getStaffOrganisation);
router.get("/active", orgController.getActiveOrganisations);
router.get("/:org_id/donation-requests", orgController.getAllDonationRequests);
router.post("/:transaction_id/donation-request-update", orgController.updateDonationRequestStatus);
router.get("/:org_id/staff-list", verifyToken, orgController.getOrganisationStaffList);

// inventory routes
router.get("/:org_id/inventory", verifyToken, orgController.getInventoryItems);
router.get("/:org_id/inventory/:inv_id", verifyToken, orgController.getInventoryItemById);
router.delete("/:org_id/inventory/:inv_id", verifyToken, orgController.removeInventoryItem);

// distribution routes
router.post("/:org_id/distribute/:inv_id", verifyToken, orgController.distributeInventoryItem);
router.get("/:org_id/distribution-records", verifyToken, orgController.getDistributionRecords);

// metrics routes
router.get("/:org_id/dashboard/summary", verifyToken, orgController.getOrgSummary);
router.get("/:org_id/dashboard/status", verifyToken, orgController.getOrgStatusBreakdown);
router.get("/:org_id/dashboard/categories", verifyToken, orgController.getOrgCategoryBreakdown);
router.get("/:org_id/dashboard/distribution-monthly", verifyToken, orgController.getOrgDistributionMonthly);
router.get("/:org_id/dashboard/environment-monthly", verifyToken, orgController.getOrgEnvironmentalMonthly);
router.get("/:org_id/dashboard/needed-categories", verifyToken, orgController.getTopNeededCategories);
router.get("/:org_id/performance-metrics", verifyToken, orgController.getOrganisationPerformanceMetrics);

module.exports = router;