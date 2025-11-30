const db = require("../config/db");
const { sendDonorNotification } = require("../helpers/donorNotifications");
const { sendEmail } = require("../helpers/mailer");
const {
  calculateSustainabilityImpact,
} = require("../helpers/sustainabilityMetrics");

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
  const { transaction_id } = req.params;
  const { status, handled_by_staff_id, reason } = req.body;

  if (!status) return res.status(400).json({ errMessage: "Status is required" });
  if (!handled_by_staff_id) return res.status(400).json({ errMessage: "Missing staff handler ID" });

  // validate status
  const allowedStatuses = ["Pending", "Accepted", "Declined", "Cancelled"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ errMessage: "Invalid donation status" });
  }

  // require reason only for Declined or Cancelled
  if ((status === "Declined" || status === "Cancelled") && !reason) {
    return res.status(400).json({
      errMessage:
        "A reason is required when declining or cancelling a donation",
    });
  }

  // validate staff existance
  const staffCheckQuery = `
    SELECT user_id 
    FROM USER 
    WHERE user_id = ? 
      AND role IN ('Admin', 'Staff') 
      AND is_active = 1
  `;

  db.get(staffCheckQuery, [handled_by_staff_id], (staffErr, staffRow) => {
    if (staffErr) {
      return res
        .status(500)
        .json({ errMessage: "Database error", error: staffErr.message });
    }

    if (!staffRow) return res.status(400).json({ errMessage: "Invalid staff ID" });

    // upddate donation transaction status
    const updateStatusQuery = `
      UPDATE DONATION_TRANSACTION
      SET status = ?, 
          handled_by_staff_id = ?, 
          handled_at = CURRENT_TIMESTAMP, 
          reason = ?
      WHERE transaction_id = ?
    `;

    db.run(
      updateStatusQuery,
      [status, handled_by_staff_id, reason || null, transaction_id],
      function (err) {
        if (err) {
          return res.status(500).json({
            errMessage: "Database error while updating donation request status",
            error: err.message,
          });
        }

        if (this.changes === 0) {
          return res
            .status(404)
            .json({ errMessage: "Donation transaction not found" });
        }

        // insert sustainability metrics on acceptance
        if (status === "Accepted") {
          const fetchCategoryQuery = `
            SELECT category 
            FROM DONATION_TRANSACTION
            WHERE transaction_id = ?
          `;

          db.get(fetchCategoryQuery, [transaction_id], (catErr, row) => {
            if (!catErr && row) {
              const impact = calculateSustainabilityImpact(row.category);

              const updateImpactQuery = `
                UPDATE DONATION_TRANSACTION
                SET estimated_co2_saved = ?, 
                    estimated_landfill_saved_kg = ?, 
                    estimated_beneficiaries = ?
                WHERE transaction_id = ?
              `;

              db.run(updateImpactQuery, [
                impact.co2,
                impact.landfill,
                impact.beneficiaries,
                transaction_id,
              ]);
            }
          });
        }

        // fetch donor to send notification
        const userQuery = `
          SELECT u.user_id, u.email
          FROM DONATION_TRANSACTION d
          JOIN USER u ON u.user_id = d.donor_id
          WHERE d.transaction_id = ?
        `;

        db.get(userQuery, [transaction_id], (userErr, userRow) => {
          if (userErr || !userRow) {
            console.error("Error fetching user for notifications:", userErr);
            return res.status(200).json({
              message: "Donation status updated, but failed to notify donor",
            });
          }

          // format decline/cancel message
          const fullMessage = `Your donation request (ID: ${transaction_id}) has been ${status}${
            reason ? `. Reason: ${reason}.` : "."
          }`;

          // send email notification
          sendEmail(
            userRow.email,
            `Donation Request ${status}`,
            fullMessage
          ).catch((e) => console.error("Error sending email:", e));

          // send in app notification
          sendDonorNotification(
            userRow.user_id,
            `Donation Request ${status}`,
            fullMessage,
            transaction_id
          );

          return res.status(200).json({
            message: "Donation request status updated successfully",
          });
        });
      }
    );
  });
};

// SUMMARY METRIC
const getOrgMetricsSummary = (req, res) => {
  const { org_id } = req.params;

  const metricsQuery = `
    SELECT
      COUNT(*) AS total_donations,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) AS accepted,
      SUM(CASE WHEN status = 'Declined' THEN 1 ELSE 0 END) AS declined,
      SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
      SUM(estimated_co2_saved) AS total_co2_saved,
      SUM(estimated_landfill_saved_kg) AS total_landfill_saved,
      SUM(estimated_beneficiaries) AS total_beneficiaries
    FROM DONATION_TRANSACTION
    WHERE org_id = ?
  `;

  db.get(metricsQuery, [org_id], (err, row) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to load organisation metrics",
        error: err.message,
      });
    }

    return res.status(200).json(row);
  });
};

// MONTHLY TREND METRIC
const getOrgMonthlyTrend = (req, res) => {
  const { org_id } = req.params;

  const metricsQuery = `
    SELECT
      strftime('%Y-%m', submitted_at) AS month,
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) AS accepted
    FROM DONATION_TRANSACTION
    WHERE org_id = ?
    GROUP BY month
    ORDER BY month ASC
  `;

  db.all(metricsQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to load monthly trend",
        error: err.message,
      });
    }

    return res.status(200).json(rows);
  });
};

// BREAKDOWN METRIC
const getOrgCategoryBreakdown = (req, res) => {
  const { org_id } = req.params;

  const metricsQuery = `
    SELECT category, COUNT(*) AS total
    FROM DONATION_TRANSACTION
    WHERE org_id = ?
    GROUP BY category
    ORDER BY total DESC
  `;

  db.all(metricsQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to load category breakdown",
        error: err.message,
      });
    }

    res.status(200).json(rows);
  });
};

// HANDLING TIME METRIC
const getOrgHandlingTime = (req, res) => {
  const { org_id } = req.params;

  const metricsQuery = `
    SELECT
      AVG(
        (julianday(handled_at) - julianday(submitted_at)) * 24
      ) AS avg_hours
    FROM DONATION_TRANSACTION
    WHERE org_id = ?
      AND handled_at IS NOT NULL
  `;

  db.get(metricsQuery, [org_id], (err, row) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to load handling time",
        error: err.message,
      });
    }

    res.status(200).json(row);
  });
};

module.exports = {
  getStaffOrganisation,
  getActiveOrganisations,
  getAllDonationRequests,
  updateDontationRequestStatus,
  getOrgMetricsSummary,
  getOrgMonthlyTrend,
  getOrgCategoryBreakdown,
  getOrgHandlingTime,
};