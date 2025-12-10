const db = require("../config/db");
const { sendDonorNotification } = require("../helpers/donorNotifications");
const { sendEmail } = require("../helpers/mailer");
const { calculateSustainabilityImpact } = require("../helpers/sustainabilityMetrics");

const {
  GENERAL_ERROR_CODES,
  GENERAL_ERROR_MESSAGES,
  ORG_ERROR_CODES,
  ORG_ERROR_MESSAGES,
  ORG_SUCCESS_CODES,
  ORG_SUCCESS_MESSAGES
} = require("../messages/errorMessages");

// -----------------------------
// STAFF ORGANISATION LOOKUP
// -----------------------------

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

// -----------------------------
// ORGANISATION DATA
// -----------------------------

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
        code: ORG_ERROR_CODES.FAILED_TO_GET_ACTIVE_ORGS,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_ACTIVE_ORGS,
        error: err.message
      });
    }

    return res.status(200).json(rows);
  });
};


// -----------------------------
// DONATION REQUESTS
// -----------------------------

// GET ALL DONATION REQUESTS
// GET ALL DONATION REQUESTS
const getAllDonationRequests = (req, res) => {
  const { org_id } = req.params;

  if (!org_id) {
    return res.status(400).json({
      code: ORG_ERROR_CODES.INVALID_ORG_ID,
      message: ORG_ERROR_MESSAGES.ORG_INVALID_ORG_ID
    });
  }

  const getDonationRequests = `
    SELECT 
      transaction_id,
      item_name,
      category,
      item_condition,
      size,
      gender,
      photo_urls,
      status,
      submitted_at,
      description,
      handled_by_staff_id,
      handled_at,
      reason
    FROM DONATION_TRANSACTION
    WHERE org_id = ?
    ORDER BY submitted_at DESC
  `;

  db.all(getDonationRequests, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_DONATION_REQUESTS,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_DONATION_REQUESTS,
        error: err.message
      });
    }

    const backend = process.env.BACKEND_URL || "";

    const formatted = rows.map(row => {
      let photos = [];
      try {                                            // parse the stored JSON string of photo URLs
        photos = JSON.parse(row.photo_urls || "[]");   // converts it into a real array
      } catch {
        photos = [];                                   // fall back to an empty array to prevent breaking the frontend
      }

      const fullUrls = photos.map(url => backend + url);

      return { ...row, photo_urls: fullUrls };         // return the original row but replace photo_urls with absolute URLs
    });

    return res.status(200).json(formatted);
  });
};

// -----------------------------
// UPDATE DONATION STATUS
// -----------------------------

// UPDATE DONATION STATUS AND NOTIFY USER ABOUT THE DECISION
const updateDonationRequestStatus = (req, res) => {
  const { transaction_id } = req.params;
  const { status, handled_by_staff_id, reason } = req.body;

  try { // validate status and inputs
    const allowedStatuses = ["Accepted", "Declined"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        code: ORG_ERROR_CODES.INVALID_DONATION_STATUS,
        message: ORG_ERROR_MESSAGES.ORG_INVALID_DONATION_STATUS
      });
    }

    if (!handled_by_staff_id) {
      return res.status(400).json({
        code: ORG_ERROR_CODES.MISSING_STAFF_HANDLER_ID,
        message: ORG_ERROR_MESSAGES.ORG_MISSING_STAFF_HANDLER_ID
      });
    }

    if (status === "Declined" && (!reason || reason.trim().length === 0)) {
      return res.status(400).json({
        code: ORG_ERROR_CODES.DECLINE_REASON_REQUIRED,
        message: ORG_ERROR_MESSAGES.ORG_DECLINE_REASON_REQUIRED
      });
    }

    // validate staff exists and has correct role
    const getStaffQuery = `
      SELECT user_id 
      FROM USER 
      WHERE user_id = ?
        AND role IN ('Admin','Staff')
        AND is_active = 1
    `;

    db.get(getStaffQuery, [handled_by_staff_id], (err, staffRow) => {
      if (err) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: err.message
        });
      }

      if (!staffRow) {
        return res.status(400).json({
          code: ORG_ERROR_CODES.INVALID_STAFF_ID,
          message: ORG_ERROR_MESSAGES.ORG_INVALID_STAFF_ID
        });
      }

      // update donation status
      const updateDonationStatus = `
        UPDATE DONATION_TRANSACTION
        SET status = ?,
            handled_by_staff_id = ?, 
            handled_at = CURRENT_TIMESTAMP, 
            reason = ?
        WHERE transaction_id = ?
      `;

      db.run(
        updateDonationStatus,
        [status, handled_by_staff_id, reason || null, transaction_id],
        function (err) {
          if (err) {
            return res.status(500).json({
              code: GENERAL_ERROR_CODES.DATABASE_ERROR,
              message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
              error: err.message
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              code: ORG_ERROR_CODES.DONATION_NOT_FOUND,
              message: ORG_ERROR_MESSAGES.ORG_DONATION_NOT_FOUND
            });
          }

          // fetch donation + donor info
          const donationAndDonorInfoQuery = `
            SELECT d.*, u.email, u.first_name
            FROM DONATION_TRANSACTION d
            LEFT JOIN USER u ON u.user_id = d.donor_id
            WHERE d.transaction_id = ?
          `;

          db.get(donationAndDonorInfoQuery, [transaction_id], (err, donation) => {
            if (err) {
              return res.status(500).json({
                code: GENERAL_ERROR_CODES.DATABASE_ERROR,
                message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
                error: err.message
              });
            }

            if (!donation) {
              return res.status(500).json({
                code: ORG_ERROR_CODES.DONOR_LOOKUP_FAILED,
                message: ORG_ERROR_MESSAGES.ORG_DONOR_LOOKUP_FAILED
              });
            }

            // IF ACCEPTED -> insert into INVENTORY table
            if (status === "Accepted") {
              let photosArray = [];
              try {
                photosArray = JSON.parse(donation.photo_urls || "[]");
              } catch {
                photosArray = [];
              }

              const firstPhoto = photosArray[0] || null;

              if (!firstPhoto) {
                return res.status(500).json({
                  code: ORG_ERROR_CODES.FAILED_TO_PARSE_IMAGES,
                  message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_PARSE_IMAGES
                });
              }

              const addDonationToInventory = `
                INSERT INTO INVENTORY
                (org_id, transaction_id, item_name, category, item_condition, size, gender, photo_urls, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

              db.run(
                addDonationToInventory,
                [
                  donation.org_id,
                  transaction_id,
                  donation.item_name,
                  donation.category,
                  donation.item_condition,
                  donation.size,
                  donation.gender,
                  JSON.stringify(photosArray),
                  donation.description
                ],
                function (err) {
                  if (err) {
                    const rollbackQuery = `
                      UPDATE DONATION_TRANSACTION
                      SET status = 'Pending',
                          handled_by_staff_id = NULL,
                          handled_at = NULL,
                          reason = NULL
                      WHERE transaction_id = ?
                    `;

                    db.run(rollbackQuery, [transaction_id], () => {
                      return res.status(500).json({
                        code: ORG_ERROR_CODES.FAILED_TO_ADD_TO_INVENTORY,
                        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_ADD_TO_INVENTORY,
                        error: err.message
                      });
                    });

                    return;
                  }

                  // send notifications + respond
                  finishSuccess(res, donation, transaction_id, status, reason);
                }
              );
            } else {
              // declined: only send notifications + respond
              finishSuccess(res, donation, transaction_id, status, reason);
            }
          });
        }
      );
    });

  } catch (err) {
    return res.status(500).json({
      code: GENERAL_ERROR_CODES.DATABASE_ERROR,
      message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
      error: err.message
    });
  }
};

// HANDLE DONATION REQUEST RESPONSE
function finishSuccess(res, donation, transaction_id, status, reason) {
  const message =
    status === "Accepted"
      ? `Your donation (ID: ${transaction_id}) has been accepted and added to the charity inventory.`
      : `Your donation (ID: ${transaction_id}) has been declined. Reason: ${reason}.`;

  try {
    sendEmail(donation.email, `Donation Request ${status}`, message);
  } catch (_) {}

  sendDonorNotification(
    donation.donor_id,
    `Donation Request ${status}`,
    message,
    transaction_id
  );

  return res.status(200).json({
    code: ORG_SUCCESS_CODES.DONATION_STATUS_UPDATED,
    message: ORG_SUCCESS_MESSAGES.ORG_DONATION_STATUS_UPDATED
  });
}


// -----------------------------
// INVENTORY
// -----------------------------

// GET INVENTORY ITEMS
const getInventoryItems = (req, res) => {
  const { org_id } = req.params;

  const getInventoryItemsQuery = `
    SELECT 
      inv_id,
      org_id,
      transaction_id,
      item_name,
      category,
      item_condition,
      size,
      gender,
      photo_urls,
      description,
      added_at
    FROM INVENTORY
    WHERE org_id = ? AND is_active = 1
    ORDER BY added_at DESC
  `;

  db.all(getInventoryItemsQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_FETCH_INVENTORY,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_FETCH_INVENTORY,
        error: err.message
      });
    }

    const backend = process.env.BACKEND_URL || "";

    const formatted = rows.map(row => {
      let photos = [];
      try {                                            // parse the stored JSON string of photo URLs
        photos = JSON.parse(row.photo_urls || "[]");   // converts it into a real array
      } catch {
        photos = [];                                   // fall back to an empty array to prevent breaking the frontend
      }

      const fullUrls = photos.map(url => backend + url);

      return { ...row, photo_urls: fullUrls };         // return the original row but replace photo_urls with absolute URLs
    });

    return res.status(200).json(formatted);
  });
};

// GET INVENTORY ITEM BY ID
const getInventoryItemById = (req, res) => {
  const { org_id, inv_id } = req.params;

  const getInventoryItemQuery = `
    SELECT *
    FROM INVENTORY
    WHERE inv_id = ? AND org_id = ?
  `;

  db.get(getInventoryItemQuery, [inv_id, org_id], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_FETCH_INVENTORY,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_FETCH_INVENTORY,
        error: err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        code: ORG_ERROR_CODES.INVENTORY_ITEM_NOT_FOUND,
        message: ORG_ERROR_MESSAGES.ORG_INVENTORY_ITEM_NOT_FOUND
      });
    }

    return res.status(200).json(row);
  });
};


// REMOVE INVENTORY ITEM
const removeInventoryItem = (req, res) => {
  const { org_id, inv_id } = req.params;

  const removeInventoryItemQuery = `
    DELETE FROM INVENTORY
    WHERE inv_id = ? AND org_id = ?
  `;

  db.run(removeInventoryItemQuery, [inv_id, org_id], function (err) {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_REMOVE_INVENTORY_ITEM,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_REMOVE_INVENTORY_ITEM,
        error: err.message
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        code: ORG_ERROR_CODES.INVENTORY_ITEM_NOT_FOUND,
        message: ORG_ERROR_MESSAGES.ORG_INVENTORY_ITEM_NOT_FOUND
      });
    }

    return res.status(200).json({
      code: ORG_SUCCESS_CODES.INVENTORY_ITEM_REMOVED,
      message: ORG_SUCCESS_MESSAGES.ORG_INVENTORY_ITEM_REMOVED
    });
  });
};


// -----------------------------
// DISTRIBUTION
// -----------------------------

// DISTRIBUTE INVENTORY ITEM
const distributeInventoryItem = (req, res) => {
  const { org_id, inv_id } = req.params;
  const { beneficiary_group } = req.body;
  const staff_id = req.user.id;

  if (!beneficiary_group || beneficiary_group.trim().length === 0) {
    return res.status(400).json({
      code: ORG_ERROR_CODES.BENEFICIARY_GROUP_REQUIRED,
      message: ORG_ERROR_MESSAGES.ORG_BENEFICIARY_GROUP_REQUIRED
    });
  }

  // validate staff memeber
  const staffCheckQuery =
    "SELECT user_id FROM ORGANISATION_STAFF WHERE user_id = ? AND org_id = ? AND is_active = 1";

  db.get(staffCheckQuery, [staff_id, org_id], (err, staffRow) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message
      });
    }

    if (!staffRow) {
      return res.status(403).json({
        code: ORG_ERROR_CODES.STAFF_NOT_AUTHORISED,
        message: ORG_ERROR_MESSAGES.ORG_STAFF_NOT_AUTHORISED
      });
    }

    // get inventory item to distribute
    const inventoryQuery =
      "SELECT * FROM INVENTORY WHERE inv_id = ? AND org_id = ? AND is_active = 1";

    db.get(inventoryQuery, [inv_id, org_id], (err, item) => {
      if (err) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: err.message
        });
      }

      if (!item) {
        return res.status(404).json({
          code: ORG_ERROR_CODES.INVENTORY_ITEM_NOT_FOUND,
          message: ORG_ERROR_MESSAGES.ORG_INVENTORY_ITEM_NOT_FOUND
        });
      }

      // use external function to calcluate impact
      const impact = calculateSustainabilityImpact(item.category, 1);

      // deactivate item after distribution
      const deactivateQuery = "UPDATE INVENTORY SET is_active = 0 WHERE inv_id = ?";
      db.run(deactivateQuery, [inv_id], function (err) {
        if (err) {
          return res.status(500).json({
            code: ORG_ERROR_CODES.FAILED_TO_UPDATE_INVENTORY,
            message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_UPDATE_INVENTORY,
            error: err.message
          });
        }

        const insertDistributionQuery = `
          INSERT INTO DISTRIBUTION_RECORD 
          (inv_id, transaction_id, org_id, beneficiary_group,
           handled_by_staff_id, co2_saved, landfill_saved, beneficiaries)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
            impact.beneficiaries
          ],
          function (err) {
            if (err) {
              return res.status(500).json({
                code: ORG_ERROR_CODES.FAILED_TO_INSERT_DISTRIBUTION,
                message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_INSERT_DISTRIBUTION,
                error: err.message
              });
            }

            const distribution_id = this.lastID;

            if (item.transaction_id) {
              const donorQuery =
                "SELECT donor_id FROM DONATION_TRANSACTION WHERE transaction_id = ?";

              db.get(donorQuery, [item.transaction_id], (err, donorRow) => {
                if (!err && donorRow) {
                  sendDonorNotification( // send in app notification
                    donorRow.donor_id,
                    'Your donation was distributed',
                    `Your donated item "${item.item_name}" has been distributed to: ${beneficiary_group}`
                  );
                }
              });
            }

            return res.status(200).json({
              code: ORG_SUCCESS_CODES.INVENTORY_ITEM_DISTRIBUTED,
              message: ORG_SUCCESS_MESSAGES.ORG_INVENTORY_ITEM_DISTRIBUTED,
              distribution_id
            });
          }
        );
      });
    });
  });
};

// GET DISTRIBUTION RECORDS
const getDistributionRecords = (req, res) => {
  const { org_id } = req.params;

  if (!org_id) {
    return res.status(400).json({
      code: ORG_ERROR_CODES.INVALID_ORG_ID,
      message: ORG_ERROR_MESSAGES.ORG_INVALID_ORG_ID
    });
  }

  const query = `
    SELECT 
      DR.beneficiary_group, 
      DR.distributed_at, 
      DR.co2_saved, 
      DR.landfill_saved, 
      DR.beneficiaries, 
      (U.first_name || ' ' || U.last_name) AS staff_name,
      DT.item_name, 
      DT.category, 
      DT.size, 
      DT.item_condition
    FROM DISTRIBUTION_RECORD DR 
    JOIN USER U 
      ON DR.handled_by_staff_id = U.user_id
    JOIN DONATION_TRANSACTION DT 
      ON DR.transaction_id = DT.transaction_id
    WHERE DR.org_id = ?
    ORDER BY DR.distributed_at DESC;
  `;

  db.all(query, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_DISTRIBUTION_RECORDS,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_DISTRIBUTION_RECORDS,
        error: err.message
      });
    }

    return res.status(200).json(rows);
  });
};


// -----------------------------
// ORGANISATION METRICS
// -----------------------------

// SUMMARY
const getOrgSummary = (req, res) => {
  const org_id = Number(req.params.org_id);

  const getOrgSummaryQuery = `
    SELECT
      (SELECT COUNT(*) FROM DONATION_TRANSACTION WHERE org_id = ? AND status = 'Pending') AS pending_requests,
      (SELECT COUNT(*) FROM DONATION_TRANSACTION WHERE org_id = ? AND status = 'Accepted') AS accepted_donations,
      (SELECT COUNT(*) FROM DISTRIBUTION_RECORD WHERE org_id = ?) AS items_distributed,
      (SELECT IFNULL(SUM(beneficiaries), 0) FROM DISTRIBUTION_RECORD WHERE org_id = ?) AS beneficiaries_served
  `;

  db.get(getOrgSummaryQuery, [org_id, org_id, org_id, org_id], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_ORG_SUMMARY,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_ORG_SUMMARY,
        error: err.message
      });
    }
    res.json(row);
  });
};


// STATUS BREAKDOWN
const getOrgStatusBreakdown = (req, res) => {
  const org_id = Number(req.params.org_id);

  const statusBreakdownQuery = `
    SELECT status, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE org_id = ?
    GROUP BY status
  `;

  db.all(statusBreakdownQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_STATUS_BREAKDOWN,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_STATUS_BREAKDOWN,
        error: err.message
      });
    }
    res.json(rows);
  });
};


// CATEGORY BREAKDOWN
const getOrgCategoryBreakdown = (req, res) => {
  const org_id = Number(req.params.org_id);

  const categoryBreakdown = `
    SELECT category, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    WHERE org_id = ? AND status = 'Accepted'
    GROUP BY category
  `;

  db.all(categoryBreakdown, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_CATEGORY_BREAKDOWN,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_CATEGORY_BREAKDOWN,
        error: err.message
      });
    }
    res.json(rows);
  });
};


// MONTHLY DISTRIBUTION TREND
const getOrgDistributionMonthly = (req, res) => {
  const org_id = Number(req.params.org_id);

  const monthlyDistributionQuery = `
    SELECT 
      strftime('%Y-%m', distributed_at) AS month,
      COUNT(*) AS total_distributed
    FROM DISTRIBUTION_RECORD
    WHERE org_id = ?
    GROUP BY month
    ORDER BY month;
  `;

  db.all(monthlyDistributionQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_DISTRIBUTION_MONTHLY,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_DISTRIBUTION_MONTHLY,
        error: err.message
      });
    }
    res.json(rows);
  });
};


// ENVIRONMENTAL IMPACT
const getOrgEnvironmentalMonthly = (req, res) => {
  const org_id = Number(req.params.org_id);

  const envrionmentImpactQuery = `
    SELECT 
      strftime('%Y-%m', distributed_at) AS month,
      SUM(co2_saved) AS total_co2,
      SUM(landfill_saved) AS total_landfill
    FROM DISTRIBUTION_RECORD
    WHERE org_id = ?
    GROUP BY month
    ORDER BY month;
  `;

  db.all(envrionmentImpactQuery, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_ENVIRONMENTAL_MONTHLY,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_ENVIRONMENTAL_MONTHLY,
        error: err.message
      });
    }
    res.json(rows);
  });
};


// TOP NEEDED CATEGORIES
const getTopNeededCategories = (req, res) => {
  const { org_id } = req.params;

  const topNeededQuery = `
    WITH demand AS (
      SELECT category, COUNT(*) AS demand_count
      FROM DONATION_TRANSACTION
      WHERE org_id = ? AND status = 'Accepted'
      GROUP BY category
    ),
    stock AS (
      SELECT category, COUNT(*) AS stock_count
      FROM INVENTORY
      WHERE org_id = ? AND is_active = 1
      GROUP BY category
    )
    SELECT 
      COALESCE(d.category, s.category) AS category,
      COALESCE(d.demand_count, 0) AS demand,
      COALESCE(s.stock_count, 0) AS stock,
      COALESCE(d.demand_count, 0) - COALESCE(s.stock_count, 0) AS gap
    FROM demand d
    FULL OUTER JOIN stock s ON d.category = s.category
    ORDER BY gap DESC;
  `;

  db.all(topNeededQuery, [org_id, org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_TOP_NEEDED,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_TOP_NEEDED,
        error: err.message
      });
    }

    return res.status(200).json(rows);
  });
};


// ORGANISATION PERFORMANCE METRICS
const getOrganisationPerformanceMetrics = (req, res) => {
  const { org_id } = req.params;

  if (!org_id) {
    return res.status(400).json({
      code: ORG_ERROR_CODES.INVALID_ORG_ID,
      message: ORG_ERROR_MESSAGES.ORG_INVALID_ORG_ID
    });
  }

  const metrics = {};

  const statusQuery = `
    SELECT
      SUM(CASE WHEN status = 'Accepted' THEN 1 ELSE 0 END) AS accepted,
      SUM(CASE WHEN status = 'Declined' THEN 1 ELSE 0 END) AS declined
    FROM DONATION_TRANSACTION
    WHERE org_id = ?;
  `;

  db.get(statusQuery, [org_id], (err, statusRow) => {
    if (err) {
      return res.status(500).json({
        code: ORG_ERROR_CODES.FAILED_TO_GET_PERFORMANCE_METRICS,
        message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_PERFORMANCE_METRICS,
        error: err.message
      });
    }

    metrics.total_accepted = statusRow.accepted;
    metrics.total_declined = statusRow.declined;
    metrics.acceptance_ratio = `${statusRow.accepted}:${statusRow.declined || 1}`;

    const distributedQuery = `
      SELECT COUNT(*) AS distributed_count
      FROM DISTRIBUTION_RECORD
      WHERE org_id = ?;
    `;

    db.get(distributedQuery, [org_id], (err, distRow) => {
      if (err) {
        return res.status(500).json({
          code: ORG_ERROR_CODES.FAILED_TO_GET_PERFORMANCE_METRICS,
          message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_PERFORMANCE_METRICS,
          error: err.message
        });
      }

      metrics.total_distributed = distRow.distributed_count;

      const avgHandlingQuery = `
        SELECT AVG(
          (julianday(handled_at) - julianday(submitted_at)) * 24
        ) AS avg_hours
        FROM DONATION_TRANSACTION
        WHERE org_id = ? AND handled_at IS NOT NULL;
      `;

      db.get(avgHandlingQuery, [org_id], (err, timeRow) => {
        if (err) {
          return res.status(500).json({
            code: ORG_ERROR_CODES.FAILED_TO_GET_PERFORMANCE_METRICS,
            message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_PERFORMANCE_METRICS,
            error: err.message
          });
        }

        metrics.avg_handling_hours = timeRow.avg_hours
          ? Number(timeRow.avg_hours).toFixed(1)
          : null;

        const staffQuery = `
          SELECT 
            U.first_name || ' ' || U.last_name AS staff_name,
            COUNT(*) AS handled_count
          FROM DONATION_TRANSACTION DT
          JOIN USER U ON U.user_id = DT.handled_by_staff_id
          WHERE DT.org_id = ?
          GROUP BY DT.handled_by_staff_id
          ORDER BY handled_count DESC
          LIMIT 1;
        `;

        db.get(staffQuery, [org_id], (err, staffRow) => {
          if (err) {
            return res.status(500).json({
              code: ORG_ERROR_CODES.FAILED_TO_GET_PERFORMANCE_METRICS,
              message: ORG_ERROR_MESSAGES.ORG_FAILED_TO_GET_PERFORMANCE_METRICS,
              error: err.message
            });
          }

          metrics.most_active_staff = staffRow || null;

          return res.status(200).json(metrics);
        });
      });
    });
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
  getDistributionRecords,
  getOrgSummary,
  getOrgStatusBreakdown,
  getOrgCategoryBreakdown,
  getOrgDistributionMonthly,
  getOrgEnvironmentalMonthly,
  getTopNeededCategories,
  getOrganisationPerformanceMetrics
};
