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

router.get("/summary", adminController.getSystemSummary);
router.get("/monthly-trend", adminController.getMonthlyTrend);
router.get("/categories", adminController.getCategoryBreakdown);
router.get("/statuses", adminController.getStatusBreakdown);
router.get("/organisation-performance", adminController.getOrgPerformance);
router.get("/user-activity", adminController.getUserActivity);
router.get("/sustainability-total", adminController.getSustainabilityTotal);

// reports
router.get("/report/:type", adminController.generateAdminReport);

module.exports = router;