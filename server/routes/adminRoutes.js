const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/users", adminController.getAllUsers);
router.put("/users", adminController.updateUser);
router.get("/organisations", adminController.getAllOrganisations);
router.post("/organisations", adminController.addOrganisation);
router.put("/organisations/status", adminController.updateOrganisationStatus);
router.delete("/organisations/:id", adminController.deleteOrganisation);
router.get("/logs", adminController.getAuditLogs);

// ORGANISATION STAFF ROUTES
router.get("/org/:org_id/staff", adminController.getOrganisationStaff);
router.post("/org/:org_id/staff", adminController.addStaffToOrganisation);
router.put("/org/:org_id/staff/:user_id", adminController.toggleOrganisationStaff);
router.delete("/org/:org_id/staff/:user_id", adminController.removeOrganisationStaff);

// metrics
router.get("/dashboard/summary", adminController.getAdminSummary);
router.get("/dashboard/monthly-activity", adminController.getMonthlyActivity);
router.get("/dashboard/org-performance", adminController.getOrgPerformance);
router.get("/dashboard/status-breakdown", adminController.getStatusBreakdown);
router.get("/dashboard/environment-monthly", adminController.getEnvironmentMonthly);

// reports
// TODO

module.exports = router;