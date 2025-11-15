const express = require("express");
const router = express.Router();
const orgController = require("../controllers/orgController");
const { verifyToken } = require("../middlewares/middlewares");

router.get("/my-organisation", verifyToken, orgController.getStaffOrganisation);

module.exports = router;