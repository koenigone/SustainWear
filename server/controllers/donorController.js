const db = require("../config/db");
const { sendDonorNotification } = require("../helpers/donorNotifications");
const { sendEmail } = require("../helpers/mailer");

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

  if (!item_name || !description || !category || !item_condition || !size || !gender) {
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
      db.get("SELECT name FROM ORGANISATION WHERE org_id = ?", [org_id], (orgErr, org) => {
        if (!orgErr && org) {
          sendDonorNotification( // create in app notification
            donor_id,
            "Donation Submitted",
            `Your donation request has been sent to ${org.name} and is awaiting review.`,
            request_id
          );

          db.get("SELECT email, first_name FROM USER WHERE user_id = ?", [donor_id],
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
      });

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
    if (err) return res.status(500).json({ errMessage: "Database error", error: err.message });
    
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
    if (err) return res.status(500).json({ errMessage: "Database error", error: err.message });

    res.json({ message: "All notifications marked as read" });
  });
};

module.exports = {
  submitDonationRequest,
  getDonorNotifications,
  markNotificationRead,
  markAllRead,
};