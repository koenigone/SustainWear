const db = require("../config/db");
const { sendDonorNotification } = require("../helpers/donorNotifications");
const { sendEmail } = require("../helpers/mailer");
const generateItemDescription = require("../services/aiDescriptionService");

const { 
  GENERAL_ERROR_CODES,
  GENERAL_ERROR_MESSAGES,
  DONOR_ERROR_CODES,
  DONOR_ERROR_MESSAGES,
  DONOR_SUCCESS_CODES,
  DONOR_SUCCESS_MESSAGES,
 } = require("../messages/errorMessages");

// -----------------------------
// DONOR DONATION LOGIC
// -----------------------------

// SUBMIT DONATION REQUEST
const submitDonationRequest = (req, res) => {
  const user_id = req.user.id;
  const { org_id, item_name, description, category, item_condition, size, gender } = req.body;

  // validate amount of photos
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ 
        code: DONOR_ERROR_CODES.REQUIRE_AT_LEAST_ONE_IMAGE,
        message: DONOR_ERROR_MESSAGES.DONOR_REQUIRE_AT_LEAST_ONE_IMAGE
      });
  }

  // build array of uploaded image URLs, up to 4 photos
  const photo_urls = req.files.map((f) => `/uploads/donations/${f.filename}`);

  if (
    !item_name ||
    !description ||
    !category ||
    !item_condition ||
    !size ||
    !gender
  ) {
    return res.status(400).json({
      code: GENERAL_ERROR_CODES.ALL_FIELDS_REQUIRED,
      message: GENERAL_ERROR_MESSAGES.ALL_FIELDS_REQUIRED
    });
  }

  const insertQuery = `
    INSERT INTO DONATION_TRANSACTION 
    (donor_id, org_id, item_name, description, category, item_condition, size, gender, photo_urls)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(insertQuery, [ user_id, org_id, item_name, description, category, item_condition, size, gender,
      JSON.stringify(photo_urls), // storing JSON array
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: err.message
        });
      }

      const request_id = this.lastID;
      const orgNameQuery = "SELECT name FROM ORGANISATION WHERE org_id = ?";

      db.get(orgNameQuery, [org_id], (orgErr, org) => {
          if (!orgErr && org) {
            sendDonorNotification(
              user_id,
              "Donation Submitted",
              `Your donation to ${org.name} has been submitted and is awaiting review.`,
              request_id
            );

            const userNameAndEmailQuery = "SELECT email, first_name FROM USER WHERE user_id = ?";
            db.get(userNameAndEmailQuery, [user_id], (userErr, user) => {
                if (!userErr && user) {
                  const subject = `Donation Submitted to ${org.name}`;
                  const message = `
                    Hi ${user.first_name},<br/><br/>
                    Your donation <b>${item_name}</b> has been submitted to 
                    <b>${org.name}</b>.<br/>
                    It is now awaiting review.<br/><br/>
                    Thank you for supporting SustainWear! 💚
                  `;
                  sendEmail(user.email, subject, message);
                }
              }
            );
          }
        }
      );

      res.status(201).json({
        code: DONOR_SUCCESS_CODES.DONATION_REQUEST_SUCCESS,
        message: DONOR_SUCCESS_MESSAGES.DONOR_DONATION_REQUEST_SUCCESS,
        request_id,
        photo_urls
      });
    }
  );
};

// GET DONOR DONATION HISTORY
const getDonationHistory = (req, res) => {
  const user_id = req.user?.id;

  const isURL = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const donationHistoryQuery = `
    SELECT 
      item_name,
      category,
      size,
      gender,
      item_condition,
      photo_urls,
      status,
      submitted_at,
      description
    FROM DONATION_TRANSACTION
    WHERE donor_id = ? AND status <> 'Rejected'
    ORDER BY submitted_at DESC
  `;

  db.all(donationHistoryQuery, [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: DONOR_ERROR_CODES.FAILED_TO_LOAD_HISTORY,
        message: DONOR_ERROR_MESSAGES.DONOR_FAILED_TO_LOAD_HISTORY,
        error: err.message
      });
    }

    const modifiedRows = rows.map((row) => {
      let photos = [];

      try {
        photos = JSON.parse(row.photo_urls || "[]");
      } catch {
        photos = [];
      }

      const fullUrls = photos.map((url) =>
        isURL(url) ? url : `${process.env.BACKEND_URL}${url}`
      );

      return {
        ...row,
        photo_urls: fullUrls,
      };
    });

    return res.status(200).json(modifiedRows);
  });
};

// -----------------------------
// DONOR NOTIFICATIONS
// -----------------------------

// GET ALL NOTIFICATIONS FOR LOGGED IN USER
const getDonorNotifications = (req, res) => {
  const user_id = req.user?.id;

  const donorNotificationsQuery = `SELECT 
      notification_id,
      title,
      message,
      created_at,
      is_read,
      related_transaction_id
    FROM NOTIFICATION
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.all(donorNotificationsQuery, [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: DONOR_ERROR_CODES.FAILED_TO_LOAD_NOTIFICATIONS,
        message: DONOR_ERROR_MESSAGES.DONOR_FAILED_TO_LOAD_NOTIFICATIONS,
        error: err.message
      });
    }

    return res.status(200).json(rows);
  });
};

// MARK ONE NOTIFICATION AS READ
const markNotificationRead = (req, res) => {
  const { notification_id } = req.params;
  const user_id = req.user?.id;

  const markReadQuery = "UPDATE NOTIFICATION SET is_read = 1 WHERE notification_id = ? AND user_id = ?";
  db.run(markReadQuery, [notification_id, user_id], (err) => {
    if (err)
      return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: err.message
        });

    res.json({
      code: DONOR_SUCCESS_CODES.NOTIFICATION_MARKED_READ,
      message: DONOR_SUCCESS_MESSAGES.DONOR_NOTIFICATION_MARKED_READ
    });
  });
};

// MARK ALL AS READ
const markAllRead = (req, res) => {
  const user_id = req.user?.id;

  const markAllReadQuery = "UPDATE NOTIFICATION SET is_read = 1 WHERE user_id = ?";
  db.run(markAllReadQuery, [user_id], (err) => {
    if (err)
      return res.status(500).json({
       code: GENERAL_ERROR_CODES.DATABASE_ERROR,
       message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
       error: err.message
      });

    res.json({
      code: DONOR_SUCCESS_CODES.NOTIFICATIONS_MARKED_ALL,
      message: DONOR_SUCCESS_MESSAGES.DONOR_NOTIFICATIONS_MARKED_ALL
    });
  });
};

// -----------------------------
// GENERATE AI DESCRIPTION
// -----------------------------
const generateDonationDescription = async (req, res) => {
  try {
    const { item_name, category, item_condition, size, gender } = req.body;

    const description = await generateItemDescription({
      item_name,
      category,
      item_condition,
      size,
      gender,
    });

    res.status(200).json({ description });
  } catch (err) {
    res.status(500).json({
      code: DONOR_ERROR_CODES.FAILED_TO_GENERATE_DESCRIPTION,
      message: DONOR_ERROR_MESSAGES.DONOR_FAILED_TO_GENERATE_DESCRIPTION,
      error: err.message
    });
  }
};

// -----------------------------
// DONOR METRICS
// -----------------------------
const getDonorSummary = (req, res) => {
  const donor_id = req.user.id;

  const getSummaryQuery = `
    SELECT 
      COUNT(*) AS total_donations,
      IFNULL((
        SELECT SUM(co2_saved)
        FROM DISTRIBUTION_RECORD dr
        JOIN DONATION_TRANSACTION dt ON dr.transaction_id = dt.transaction_id
        WHERE dt.donor_id = ?
      ), 0) AS total_co2,
      IFNULL((
        SELECT SUM(landfill_saved)
        FROM DISTRIBUTION_RECORD dr
        JOIN DONATION_TRANSACTION dt ON dr.transaction_id = dt.transaction_id
        WHERE dt.donor_id = ?
      ), 0) AS total_landfill,
      IFNULL((
        SELECT SUM(beneficiaries)
        FROM DISTRIBUTION_RECORD dr
        JOIN DONATION_TRANSACTION dt ON dr.transaction_id = dt.transaction_id
        WHERE dt.donor_id = ?
      ), 0) AS total_beneficiaries
    FROM DONATION_TRANSACTION
    WHERE donor_id = ?;
  `;

  db.get(getSummaryQuery, [donor_id, donor_id, donor_id, donor_id], (err, row) => {
    if (err) return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      error: err.message
    });

    res.json(row);
  });
};

const getDonationStatusBreakdown = (req, res) => {
  const donor_id = req.user.id;

  const statusBreakdownQuery = `
    SELECT status, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE donor_id = ?
    GROUP BY status;
  `;

  db.all(statusBreakdownQuery, [donor_id], (err, rows) => {
    if (err) return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      error: err.message
    });
    res.json(rows);
  });
};

const getDonationCategoryBreakdown = (req, res) => {
  const donor_id = req.user.id;

  const categoryBreakdownQuery = `
    SELECT category, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE donor_id = ?
    GROUP BY category;
  `;

  db.all(categoryBreakdownQuery, [donor_id], (err, rows) => {
    if (err) return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      error: err.message
    });
    res.json(rows);
  });
};

const getMonthlyImpact = (req, res) => {
  const donor_id = req.user.id;

  const monthlyImpactQuery = `
    SELECT 
      strftime('%Y-%m', dr.distributed_at) AS month,
      SUM(dr.co2_saved) AS total_co2,
      SUM(dr.landfill_saved) AS total_landfill,
      SUM(dr.beneficiaries) AS beneficiaries
    FROM DISTRIBUTION_RECORD dr
    JOIN DONATION_TRANSACTION dt ON dr.transaction_id = dt.transaction_id
    WHERE dt.donor_id = ?
    GROUP BY month
    ORDER BY month;
  `;

  db.all(monthlyImpactQuery, [donor_id], (err, rows) => {
    if (err) return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      error: err.message
    });
    res.json(rows);
  });
};

const getRecentActivity = (req, res) => {
  const donor_id = req.user.id;

  const recentActivityQuery = `
    SELECT
      dt.transaction_id AS id,
      dt.item_name,
      dt.status AS action_type,
      dt.submitted_at AS timestamp,
      dt.reason AS details,
      NULL AS beneficiary_group,
      NULL AS co2_saved,
      NULL AS landfill_saved,
      NULL AS beneficiaries
    FROM DONATION_TRANSACTION dt
    WHERE dt.donor_id = ?

    UNION ALL

    SELECT
      dr.transaction_id AS id,
      (SELECT item_name FROM DONATION_TRANSACTION WHERE transaction_id = dr.transaction_id),
      'Distributed' AS action_type,
      dr.distributed_at AS timestamp,
      NULL AS details,
      dr.beneficiary_group,
      dr.co2_saved,
      dr.landfill_saved,
      dr.beneficiaries
    FROM DISTRIBUTION_RECORD dr
    JOIN DONATION_TRANSACTION dt ON dt.transaction_id = dr.transaction_id
    WHERE dt.donor_id = ?

    ORDER BY timestamp DESC
    LIMIT 5
  `;

  db.all(recentActivityQuery, [donor_id, donor_id], (err, rows) => {
    if (err) return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      error: err.message
    });
    res.json(rows);
  });
};

const getDonorLeaderboard = (req, res) => {
  const donor_id = req.user.id;

  const donorsLeaderboardQuery = `
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name AS name,
      (
        SELECT COUNT(*)
        FROM DONATION_TRANSACTION dt
        WHERE dt.donor_id = u.user_id
        AND dt.status = 'Accepted'
      ) AS accepted_count
    FROM USER u
    WHERE u.role = 'Donor'
    ORDER BY accepted_count DESC
    LIMIT 7;
  `;

  db.all(donorsLeaderboardQuery, [], (err, rows) => {
    if (err) return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      error: err.message
    });

    const rankQuery = `
      SELECT
        u.user_id,
        (
          SELECT COUNT(*)
          FROM DONATION_TRANSACTION dt
          WHERE dt.donor_id = u.user_id
          AND dt.status = 'Accepted'
        ) AS accepted_count
      FROM USER u
      WHERE u.role = 'Donor'
      ORDER BY accepted_count DESC
    `;

    db.all(rankQuery, [], (err2, allRows) => {
      if (err2) return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err2.message
      });

      const rank = allRows.findIndex((r) => r.user_id === donor_id) + 1;

      const currentUser = rows.find((r) => r.user_id === donor_id) || {
        user_id: donor_id,
        name: "You",
        accepted_count: 0,
      };

      res.json({
        rank,
        leaderboard: rows,
        currentUser,
      });
    });
  });
};

module.exports = {
  submitDonationRequest,
  getDonorNotifications,
  markNotificationRead,
  markAllRead,
  getDonationHistory,
  generateDonationDescription,
  getDonorSummary,
  getDonationStatusBreakdown,
  getDonationCategoryBreakdown,
  getMonthlyImpact,
  getRecentActivity,
  getDonorLeaderboard,
};