const db = require("../config/db");
const { sendDonorNotification } = require("../helpers/donorNotifications");
const { sendEmail } = require("../helpers/mailer");
const generateItemDescription = require("../services/aiDescriptionService");

// SUBMIT DONATION REQUEST
const submitDonationRequest = (req, res) => {
  const donor_id = req.user?.id;
  const {
    org_id,
    item_name,
    description,
    category,
    item_condition,
    size,
    gender,
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ errMessage: "Image upload is required." });
  }

  const photo_url = `/uploads/donations/${req.file.filename}`;

  if (
    !item_name ||
    !description ||
    !category ||
    !item_condition ||
    !size ||
    !gender
  ) {
    return res.status(400).json({ errMessage: "All fields are required." });
  }

  if (!org_id) {
    return res.status(400).json({ errMessage: "Organisation ID is required." });
  }

  // insert donation request into DB
  const insertQuery = `
    INSERT INTO DONATION_TRANSACTION 
    (donor_id, org_id, item_name, description, category, item_condition, size, gender, photo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertQuery,
    [
      donor_id,
      org_id,
      item_name,
      description,
      category,
      item_condition,
      size,
      gender,
      photo_url,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          errMessage: "Database error",
          error: err.message,
        });
      }

      const request_id = this.lastID;

      // get org info and donor info for notification and email
      db.get(
        "SELECT name FROM ORGANISATION WHERE org_id = ?",
        [org_id],
        (orgErr, org) => {
          if (!orgErr && org) {
            sendDonorNotification(
              // create in app notification
              donor_id,
              "Donation Submitted",
              `Your donation request has been sent to ${org.name} and is awaiting review.`,
              request_id
            );

            db.get(
              "SELECT email, first_name FROM USER WHERE user_id = ?",
              [donor_id],
              (userErr, user) => {
                if (!userErr && user) {
                  const subject = `Donation Submitted to ${org.name}`;
                  const message = `
                  Hi ${user.first_name},<br/><br/>
                  Your donation <b>${item_name}</b> has been successfully submitted to 
                  <b>${org.name}</b>.<br/>
                  It is now awaiting review.<br/><br/>
                  Thank you for supporting SustainWear! 💚
                `;

                  sendEmail(user.email, subject, message); // send confirmation email
                }
              }
            );
          }
        }
      );

      // respond with success
      res.status(201).json({
        message: "Donation request submitted successfully",
        request_id,
        photo_url,
      });
    }
  );
};

// GET ALL NOTIFICATIONS FOR LOGGED IN USER
const getDonorNotifications = (req, res) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ errMessage: "Unauthorized" });

  const query = `
    SELECT 
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

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to load notifications",
        error: err.message,
      });
    }

    return res.status(200).json(rows);
  });
};

// MARK ONE NOTIFICATION AS READ
const markNotificationRead = (req, res) => {
  const { notification_id } = req.params;

  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ errMessage: "Unauthorized" });

  const query = `
    UPDATE NOTIFICATION
    SET is_read = 1
    WHERE notification_id = ? AND user_id = ?
  `;
  db.run(query, [notification_id, user_id], (err) => {
    if (err)
      return res
        .status(500)
        .json({ errMessage: "Database error", error: err.message });

    res.json({ message: "Notification marked as read" });
  });
};

// MARK ALL AS READ
const markAllRead = (req, res) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ errMessage: "Unauthorized" });

  const query = `
    UPDATE NOTIFICATION
    SET is_read = 1
    WHERE user_id = ?
  `;

  db.run(query, [user_id], (err) => {
    if (err)
      return res
        .status(500)
        .json({ errMessage: "Database error", error: err.message });

    res.json({ message: "All notifications marked as read" });
  });
};

// Get donors donation history
const getDonationHistory = (req, res) => {
  const user_id = req.user?.id;

  // used to check if photo_url is already a full URL
  const isURL = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  if (!user_id) return res.status(401).json({ errMessage: "Unauthorized" });

  // switch table from requests to transactions on pull
  const query = `
    SELECT 
      item_name,
      category,
      size,
      gender,
      item_condition,
      photo_url,
      status,
      submitted_at,
      description
    FROM DONATION_TRANSACTION
    WHERE donor_id = ? AND status <> 'Rejected'
    ORDER BY submitted_at DESC`;

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to load donation history",
        error: err.message,
      });
    }

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

// GENERATE DONATION DESCRIPTION USING AI
const generateDonationDescription = async (req, res) => {
  try {
    const { item_name, category, item_condition, size, gender } = req.body;

    // call AI service and pass parameters from request body
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
      errMessage: "Failed to generate description",
      debug: err?.message || err,
    });
  }
};

// DONOR METRICS

// SUMMARY CARDS (total donations, co2 saved, landfill, beneficiaries)
const getDonorSummary = (req, res) => {
  const donor_id = req.user.id;

  const query = `
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

  db.get(query, [donor_id, donor_id, donor_id, donor_id], (err, row) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(row);
  });
};

// STATUS BREAKDOWN
const getDonationStatusBreakdown = (req, res) => {
  const donor_id = req.user.id;

  const query = `
    SELECT status, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE donor_id = ?
    GROUP BY status;
  `;

  db.all(query, [donor_id], (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
  });
};

// CATECORY BREAKDOWN
const getDonationCategoryBreakdown = (req, res) => {
  const donor_id = req.user.id;

  const query = `
    SELECT category, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE donor_id = ?
    GROUP BY category;
  `;

  db.all(query, [donor_id], (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
  });
};

// MONTHLY CO2 SAVED (value to donor)
const getMonthlyImpact = (req, res) => {
  const donor_id = req.user.id;

  const query = `
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

  db.all(query, [donor_id], (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
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
};