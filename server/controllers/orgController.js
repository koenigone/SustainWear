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

const updateDonationRequestStatus = async (req, res) => {
  const { transaction_id } = req.params;
  const { status, handled_by_staff_id, reason } = req.body;

  // only two allowed statuses now
  const allowedStatuses = ["Accepted", "Declined"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ errMessage: "Invalid donation status" });
  }

  if (!handled_by_staff_id) {
    return res.status(400).json({ errMessage: "Missing staff handler ID" });
  }

  if (status === "Declined" && !reason) {
    return res.status(400).json({
      errMessage: "A reason is required when declining a donation",
    });
  }

  try { // validate staff
    const staffRow = await new Promise((resolve, reject) => {
      db.get(
        `
          SELECT user_id 
          FROM USER 
          WHERE user_id = ? 
            AND role IN ('Admin','Staff') 
            AND is_active = 1
        `,
        [handled_by_staff_id],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (!staffRow) {
      return res.status(400).json({ errMessage: "Invalid staff ID" });
    }

    // update donation status
    const donationUpdated = await new Promise((resolve, reject) => {
      db.run(
        `
          UPDATE DONATION_TRANSACTION
          SET status = ?, 
              handled_by_staff_id = ?, 
              handled_at = CURRENT_TIMESTAMP, 
              reason = ?
          WHERE transaction_id = ?
        `,
        [status, handled_by_staff_id, reason || null, transaction_id],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (donationUpdated === 0) {
      return res
        .status(404)
        .json({ errMessage: "Donation transaction not found" });
    }

    // fetch donation + donor email
    const donation = await new Promise((resolve, reject) => {
      db.get(
        `
          SELECT d.*, u.email 
          FROM DONATION_TRANSACTION d
          JOIN USER u ON u.user_id = d.donor_id
          WHERE d.transaction_id = ?
        `,
        [transaction_id],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (!donation) {
      return res.status(500).json({
        errMessage: "Donation updated but donor lookup failed",
      });
    }

    // if Accepted -> Insert into Inventory
    if (status === "Accepted") {
      await new Promise((resolve, reject) => {
        db.run(
          `
            INSERT INTO INVENTORY 
            (org_id, transaction_id, item_name, category, item_condition, size, gender, photo_url, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            donation.org_id,
            transaction_id,
            donation.item_name,
            donation.category,
            donation.item_condition,
            donation.size,
            donation.gender,
            donation.photo_url,
            donation.description,
          ],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // build donor notification message
    const message =
      status === "Accepted"
        ? `Your donation (ID: ${transaction_id}) has been accepted and added to the charity inventory.`
        : `Your donation (ID: ${transaction_id}) has been declined. Reason: ${reason}.`;

    // send email
    try {
      await sendEmail(donation.email, `Donation Request ${status}`, message);
    } catch (e) {
      console.error("Email send failed:", e);
    }

    // send in-app notification
    sendDonorNotification(
      donation.donor_id,
      `Donation Request ${status}`,
      message,
      transaction_id
    );

    return res.status(200).json({
      message: `Donation request ${status} successfully`,
    });
  } catch (err) {
    console.error("Error updating request:", err);
    return res.status(500).json({
      errMessage: "Internal server error",
      error: err.message,
    });
  }
};

// INVENTORY LOGIC

// GET ITEM
const getInventoryItems = (req, res) => {
  const { org_id } = req.params;

  const query = `
    SELECT 
      inv_id,
      org_id,
      transaction_id,
      item_name,
      category,
      item_condition,
      size,
      gender,
      photo_url,
      description,
      added_at
    FROM INVENTORY
    WHERE org_id = ?
    ORDER BY added_at DESC
  `;

  db.all(query, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to fetch inventory items",
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

    const BACKEND_URL = process.env.BACKEND_URL;

    const fixedRows = rows.map((row) => {
      if (row.photo_url && !isURL(row.photo_url)) {
        return {
          ...row,
          photo_url: `${BACKEND_URL}${row.photo_url}`,
        };
      }
      return row;
    });

    return res.status(200).json(fixedRows);
  });
};

// GET ITEM BY ID
const getInventoryItemById = (req, res) => {
  const { org_id, inv_id } = req.params;

  const getInventoryItems = `
    SELECT *
    FROM INVENTORY
    WHERE inv_id = ? AND org_id = ?
  `;

  db.get(getInventoryItems, [inv_id, org_id], (err, row) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to fetch inventory item",
        error: err.message,
      });
    }

    if (!row) {
      return res.status(404).json({ errMessage: "Inventory item not found" });
    }

    return res.status(200).json(row);
  });
};

// REMOVE ITEM BY ID
const removeInventoryItem = (req, res) => {
  const { org_id, inv_id } = req.params;

  const removeInventoryItem = `
    DELETE FROM INVENTORY
    WHERE inv_id = ? AND org_id = ?
  `;

  db.run(removeInventoryItem, [inv_id, org_id], function (err) {
    if (err) {
      return res.status(500).json({
        errMessage: "Failed to remove inventory item",
        error: err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        errMessage: "Inventory item not found",
      });
    }

    return res.status(200).json({
      message: "Inventory item removed successfully",
    });
  });
};

// DISTRIBUTE INVENTORY ITEM
const distributeInventoryItem = (req, res) => {
  const { org_id, inv_id } = req.params;
  const { beneficiary_group } = req.body;
  const staff_id = req.user.id;

  if (!beneficiary_group || beneficiary_group.trim().length === 0) {
    return res.status(400).json({
      errMessage: "Beneficiary group is required",
    });
  }

  // validate staff is assigned to this organisation
  const staffCheckQuery = `
    SELECT user_id
    FROM ORGANISATION_STAFF
    WHERE user_id = ? AND org_id = ? AND is_active = 1
  `;

  db.get(staffCheckQuery, [staff_id, org_id], (err, staffRow) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Database error during staff validation",
        error: err.message,
      });
    }
    if (!staffRow) {
      return res.status(403).json({
        errMessage: "Not authorised to distribute items for this organisation",
      });
    }

    // fetch the inventory item
    const inventoryQuery = `
      SELECT *
      FROM INVENTORY
      WHERE inv_id = ? AND org_id = ? AND is_active = 1
    `;

    db.get(inventoryQuery, [inv_id, org_id], (err, item) => {
      if (err) {
        return res.status(500).json({
          errMessage: "Database error during inventory lookup",
          error: err.message,
        });
      }
      if (!item) {
        return res.status(404).json({
          errMessage: "Inventory item not found",
        });
      }

      // calculate sustainability impact using the helper calculator
      const impact = calculateSustainabilityImpact(item.category, 1);

      // SOFT DELETE (mark inventory item as inactive)
      const deactivateInventoryQuery = `
        UPDATE INVENTORY
        SET is_active = 0
        WHERE inv_id = ?
      `;

      db.run(deactivateInventoryQuery, [inv_id], function (err) {
        if (err) {
          return res.status(500).json({
            errMessage: "Failed to update inventory item",
            error: err.message,
          });
        }

        // insert distribution record
        const insertDistributionQuery = `
          INSERT INTO DISTRIBUTION_RECORD 
          (inv_id, transaction_id, org_id, quantity_distributed, beneficiary_group,
           handled_by_staff_id, co2_saved, landfill_saved, beneficiaries)
          VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)
        `;

        db.run(
          insertDistributionQuery,
          [
            inv_id,
            item.transaction_id,
            org_id,
            beneficiary_group,
            staff_id,
            impact.co2_saved,
            impact.landfill_saved,
            impact.beneficiaries,
          ],
          function (err) {
            if (err) {
              return res.status(500).json({
                errMessage:
                  "Distribution succeeded but failed to create distribution record",
                error: err.message,
              });
            }

            const distribution_id = this.lastID;

            // notify donor only if donation exists
            if (item.transaction_id) {
              const donorQuery = `
                SELECT donor_id 
                FROM DONATION_TRANSACTION 
                WHERE transaction_id = ?
              `;

              db.get(donorQuery, [item.transaction_id], (err, donorRow) => {
                if (!err && donorRow) {
                  sendDonorNotification(
                    donorRow.donor_id,
                    "Your donation was distributed",
                    `Your donated item "${item.item_name}" has been distributed to: ${beneficiary_group}`
                  );
                }
              });
            }

            return res.status(200).json({
              message: "Item distributed successfully",
              distribution_id,
            });
          }
        );
      });
    });
  });
};

// ORGANISATION METRICS

// SUMMARY
const getOrgSummary = (req, res) => {
  const org_id = Number(req.params.org_id);

  const query = `
    SELECT
      -- pending
      (SELECT COUNT(*) 
       FROM DONATION_TRANSACTION 
       WHERE org_id = ? AND status = 'Pending') AS pending_requests,

      -- accepted
      (SELECT COUNT(*) 
       FROM DONATION_TRANSACTION 
       WHERE org_id = ? AND status = 'Accepted') AS accepted_donations,

      -- distributed
      (SELECT COUNT(*) 
       FROM DISTRIBUTION_RECORD 
       WHERE org_id = ?) AS items_distributed,

      -- beneficiaries
      (SELECT IFNULL(SUM(beneficiaries), 0)
       FROM DISTRIBUTION_RECORD
       WHERE org_id = ?) AS beneficiaries_served
  `;

  db.get(query, [org_id, org_id, org_id, org_id], (err, row) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(row);
  });
};

// STATUS BREAKDOWN
const getOrgStatusBreakdown = (req, res) => {
  const org_id = Number(req.params.org_id);

  const query = `
    SELECT status, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE org_id = ?
    GROUP BY status
  `;

  db.all(query, [org_id], (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
  });
};

// CATEGORY BREAKDOWN
const getOrgCategoryBreakdown = (req, res) => {
  const org_id = Number(req.params.org_id);

  const query = `
    SELECT category, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE org_id = ? AND status = 'Accepted'
    GROUP BY category
  `;

  db.all(query, [org_id], (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
  });
};

// MONTHLY DISTRIBUTION TREND
const getOrgDistributionMonthly = (req, res) => {
  const org_id = Number(req.params.org_id);

  const query = `
    SELECT 
      strftime('%Y-%m', distributed_at) AS month,
      COUNT(*) AS total_distributed
    FROM DISTRIBUTION_RECORD
    WHERE org_id = ?
    GROUP BY month
    ORDER BY month;
  `;

  db.all(query, [org_id], (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
  });
};

// ENVIROMENTAL IMPACT
const getOrgEnvironmentalMonthly = (req, res) => {
  const org_id = Number(req.params.org_id);

  const query = `
    SELECT 
      strftime('%Y-%m', distributed_at) AS month,
      SUM(co2_saved) AS total_co2,
      SUM(landfill_saved) AS total_landfill
    FROM DISTRIBUTION_RECORD
    WHERE org_id = ?
    GROUP BY month
    ORDER BY month;
  `;

  db.all(query, [org_id], (err, rows) => {
    if (err) return res.status(500).json({ err: err.message });
    res.json(rows);
  });
};

module.exports = {
  getStaffOrganisation,
  getActiveOrganisations,
  getAllDonationRequests,
  updateDonationRequestStatus,
  getInventoryItems,
  getInventoryItemById,
  removeInventoryItem,
  distributeInventoryItem,
  getOrgSummary,
  getOrgStatusBreakdown,
  getOrgCategoryBreakdown,
  getOrgDistributionMonthly,
  getOrgEnvironmentalMonthly,
};