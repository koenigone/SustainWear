const db = require("../config/db");

// GET STAFF'S ORGANISATION INFO
const getStaffOrganisation = (user_id, callback) => {
  const staffOrgQuery = `
    SELECT O.org_id, O.name 
    FROM ORGANISATION O
    JOIN ORGANISATION_STAFF OS ON O.org_id = OS.org_id
    WHERE OS.user_id = ? AND OS.is_active = 1
  `;
  db.get(staffOrgQuery, [user_id], callback);
};

// GET ALL ACTIVE ORGANISATIONS
const getActiveOrganisations = (req, res) => {
  const activeOrgsQuery = `
    SELECT 
      org_id, 
      name, 
      city, 
      contact_email
    FROM ORGANISATION
    WHERE is_active = 1
    ORDER BY name ASC
  `;

  db.all(activeOrgsQuery, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Database error while retrieving organisations",
        error: err.message
      });
    }

    return res.status(200).json(rows);
  });
};

// GET ALL DONATION REQUESTS
const getAllDonationRequests = (req, res) => {
  const { org_id } = req.params;

  const donationRequestsQuery = `
  SELECT 
    item_name, 
    category, 
    item_condition, 
    size, gender, 
    photo_url, 
    status, 
    submitted_at, 
    description
  FROM DONATION_TRANSACTION
  WHERE org_id = ?`;

  db.all(donationRequestsQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Database error while retrieving donation requests",
        error: err.message
      });
    }

    return res.status(200).json(rows);
  });
}

module.exports = {
  getStaffOrganisation,
  getActiveOrganisations,
  getAllDonationRequests,
};