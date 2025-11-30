const db = require("../config/db");
const { sendDonorNotification } = require("../helpers/donorNotifications");
const { sendEmail } = require("../helpers/mailer");

const getStaffOrganisation = (user_id, callback) => {
  const staffOrgQuery = `
    SELECT O.org_id, O.name, OS.org_staff_id
    FROM ORGANISATION O
    JOIN ORGANISATION_STAFF OS ON O.org_id = OS.org_id
    WHERE OS.user_id = ? AND OS.is_active = 1
  `;
  db.get(staffOrgQuery, [user_id], callback);
};

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

    const isURL = (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    };

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

      const userQuery = `SELECT user_id, email
        FROM DONATION_TRANSACTION d
        JOIN USER u ON u.user_id = d.donor_id
        WHERE transaction_id = ?;`;

      db.get(userQuery, [transaction_id], (userErr, userRow) => {
        if (userErr) {
          console.error("Error fetching user for notifications:", userErr);
          return res.status(200).json({
            message:
              "Donation request status updated successfully but failed to fetch user for notifications",
            changes: this.changes,
          });
        }

        try {
          sendEmail(
            userRow.email,
            `Donation Request ${status}`,
            `Your donation request (ID: ${transaction_id}) has been ${status} ${
              reason ? ` Reason: ${reason}` : ""
            }.`
          );
        } catch (emailErr) {
          console.error("Error sending email notification:", emailErr);
        }

        try {
          sendDonorNotification(
            userRow.user_id,
            `Donation Request ${status}`,
            `Your donation request (ID: ${transaction_id}) has been ${status} ${
              reason ? ` Reason: ${reason}` : ""
            }.`,
            transaction_id
          );
        } catch (notifErr) {
          console.error("Error sending donor notification:", notifErr);
        }

        return res.status(200).json({
          message: "Donation request status updated successfully",
          changes: this.changes,
        });
      });
    }
  );
};

const getStaffActivity = (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT 
      item_name,
      old_status,
      new_status,
      change_reason,
      changed_at,
      (SELECT username FROM USER WHERE user_id = DT.handled_by_staff_id) AS staff_name
    FROM DONATION_TRANSACTION_STATUS_LOG DT
    WHERE DT.handled_by_staff_id = ?
    ORDER BY changed_at DESC
  `;

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Database error while retrieving staff activity",
        error: err.message,
      });
    }
    return res.status(200).json(rows);
  });
};

module.exports = {
  getStaffOrganisation,
  getActiveOrganisations,
  getAllDonationRequests,
  updateDontationRequestStatus,
  getStaffActivity,
};

