const db = require("../config/db");

// GET STAFF'S ORGANISATION INFO
const getStaffOrganisation = (user_id, callback) => {
  const staffOrgQuery = `
    SELECT O.org_id, O.name, OS.org_staff_id
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
        error: err.message,
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
    transaction_id,
    item_name, 
    category, 
    item_condition, 
    size, gender, 
    photo_url, 
    status, 
    submitted_at, 
    description,
    handled_by_staff_id,
    handled_at,
    reason
  FROM DONATION_TRANSACTION
  WHERE org_id = ?`;

  db.all(donationRequestsQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Database error while retrieving donation requests",
        error: err.message,
      });
    }

    // used to check if photo_url is already a full URL
    const isURL = (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    };
    // modify photo_url to be full URL if not already
    const modifiedRows = rows.map((row) => {
      if (row.photo_url && !isURL(row.photo_url)) {
        return {
          ...row,
          photo_url: `${process.env.BACKEND_URL}${row.photo_url}`,
        };
      } else {
        return row;
      }
    });
    return res.status(200).json(modifiedRows);
  });
};

const updateDontationRequestStatus = (req, res) => {
  console.log("Received request to update donation request status");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);

  const { transaction_id } = req.params;
  const { status, handled_by_staff_id, reason } = req.body;

  const updateStatusQuery = `
    UPDATE DONATION_TRANSACTION
    SET status = ?, handled_by_staff_id = ?, handled_at = CURRENT_TIMESTAMP, reason = ?
    WHERE transaction_id = ?`;

  db.run(
    updateStatusQuery,
    [status, handled_by_staff_id, reason, transaction_id],
    (err) => {
      if (err) {
        return res.status(500).json({
          errMessage: "Database error while updating donation request status",
          error: err.message,
        });
      }

      return res.status(200).json({
        message: "Donation request status updated successfully",
        changes: this.changes,
      });
    }
  );
};

module.exports = {
  getStaffOrganisation,
  getActiveOrganisations,
  getAllDonationRequests,
  updateDontationRequestStatus,
};
