const db = require("../config/db");
const { logAdminAction } = require("../helpers/logAdminAction");
const { validateOrganisationInput } = require("../helpers/inputValidations");
const { generateReportData } = require("../helpers/adminReportService");
const { PDFDocument, StandardFonts } = require("pdf-lib");

const {
  GENERAL_ERROR_CODES,
  GENERAL_ERROR_MESSAGES,
  ADMIN_ERROR_CODES,
  ADMIN_ERROR_MESSAGES,
  ADMIN_SUCCESS_CODES,
  ADMIN_SUCCESS_MESSAGES,
} = require("../messages/errorMessages");

// UPDATE USER ROLE (Admin only)
const updateUser = (req, res) => {
  const { user_id, role, is_active } = req.body;
  const admin_id = req.user?.id;

  if (!user_id) {
    return res.status(400).json({
      code: ADMIN_ERROR_CODES.INVALID_USER_ID,
      message: ADMIN_ERROR_MESSAGES.ADMIN_INVALID_USER_ID,
    });
  }

  if (role !== "Donor" && role !== "Admin") {
    return res.status(400).json({
      code: ADMIN_ERROR_CODES.INVALID_ROLE,
      message: ADMIN_ERROR_MESSAGES.ADMIN_INVALID_ROLE,
    });
  }

  const normalizedStatus = Number(is_active);
  const checkUserQuery = `SELECT role, is_active FROM USER WHERE user_id = ?`;

  db.get(checkUserQuery, [user_id], (err, user) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }

    if (!user) {
      return res.status(404).json({
        code: ADMIN_ERROR_CODES.USER_NOT_FOUND,
        message: ADMIN_ERROR_MESSAGES.ADMIN_USER_NOT_FOUND,
      });
    }

    if (user.role === "Admin" && normalizedStatus === 0) {
      return res.status(403).json({
        code: ADMIN_ERROR_CODES.CANNOT_DEACTIVATE_ADMIN,
        message: ADMIN_ERROR_MESSAGES.ADMIN_CANNOT_DEACTIVATE_ADMIN,
      });
    }

    if (user.role === "Admin" && role === "Donor") {
      return res.status(403).json({
        code: ADMIN_ERROR_CODES.CANNOT_DEMOTE_ADMIN,
        message: ADMIN_ERROR_MESSAGES.ADMIN_CANNOT_DEMOTE_ADMIN,
      });
    }

    let updateQuery;
    let params;

    if (normalizedStatus === 0) {
      updateQuery = `
        UPDATE USER 
        SET role = ?, is_active = 0, deactivation_type = 'ADMIN'
        WHERE user_id = ?
      `;
      params = [role, user_id];
    } else {
      updateQuery = `
        UPDATE USER 
        SET role = ?, is_active = 1, deactivation_type = NULL
        WHERE user_id = ?
      `;
      params = [role, user_id];
    }

    db.run(updateQuery, params, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: updateErr.message,
        });
      }

      if (role !== user.role) {
        if (role === "Admin" && user.role !== "Admin") {
          logAdminAction(admin_id, "USER", "USER_ROLE_CHANGED", user_id, null, {
            old_role: user.role,
            new_role: role,
          });
        }
      }

      if (normalizedStatus !== user.is_active) {
        if (normalizedStatus === 1) {
          logAdminAction(admin_id, "USER", "USER_ACTIVATED", user_id);
        } else {
          logAdminAction(admin_id, "USER", "USER_DEACTIVATED", user_id);
        }
      }

      return res.status(200).json({
        code: ADMIN_SUCCESS_CODES.USER_UPDATED,
        message: ADMIN_SUCCESS_MESSAGES.ADMIN_USER_UPDATED,
      });
    });
  });
};

// GET ALL USERS
const getAllUsers = (req, res) => {
  const query = `SELECT user_id, first_name, last_name, email, role, is_active FROM USER`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.status(200).json(rows);
  });
};

// ADD NEW ORGANISATION
const addOrganisation = (req, res) => {
  const admin_id = req.user?.id;
  const { name, description, street_name, post_code, city, contact_email } =
    req.body;

  const validationError = validateOrganisationInput(req.body);
  if (validationError) {
    return res.status(400).json(validationError);
  }

  const checkQuery = `SELECT org_id FROM ORGANISATION WHERE name = ?`;

  db.get(checkQuery, [name], (checkErr, existing) => {
    if (checkErr) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: checkErr.message,
      });
    }

    if (existing) {
      return res.status(400).json({
        code: ADMIN_ERROR_CODES.ORG_NAME_EXISTS,
        message: ADMIN_ERROR_MESSAGES.ADMIN_ORG_NAME_EXISTS,
      });
    }

    const insertQuery = `
      INSERT INTO ORGANISATION (
        name, description, street_name, post_code, city, contact_email
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertQuery,
      [name, description, street_name, post_code, city, contact_email],
      function (insertErr) {
        if (insertErr) {
          return res.status(500).json({
            code: ADMIN_ERROR_CODES.FAILED_TO_ADD_ORGANISATION,
            message: ADMIN_ERROR_MESSAGES.ADMIN_FAILED_TO_ADD_ORGANISATION,
            error: insertErr.message,
          });
        }

        const orgId = this.lastID;

        logAdminAction(admin_id, "ORGANISATION", "ORG_CREATED", null, orgId, {
          org_name: name,
        });

        return res.status(201).json({
          code: ADMIN_SUCCESS_CODES.ORG_ADDED,
          message: ADMIN_SUCCESS_MESSAGES.ADMIN_ORG_ADDED,
          org_id: orgId,
        });
      }
    );
  });
};

// GET ALL ORGANISATIONS
const getAllOrganisations = (req, res) => {
  const query = `SELECT * FROM ORGANISATION ORDER BY created_at DESC`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.status(200).json(rows);
  });
};

// UPDATE ORGANISATION STATUS (activate / deactivate)
const updateOrganisationStatus = (req, res) => {
  const admin_id = req.user?.id;
  const { org_id, is_active } = req.body;

  if (!org_id) {
    return res.status(400).json({
      code: ADMIN_ERROR_CODES.INVALID_ORGANISATION_ID,
      message: ADMIN_ERROR_MESSAGES.ADMIN_INVALID_ORGANISATION_ID,
    });
  }

  if (typeof is_active === "undefined") {
    return res.status(400).json({
      code: ADMIN_ERROR_CODES.ALL_FIELDS_REQUIRED,
      message: ADMIN_ERROR_MESSAGES.ADMIN_ALL_FIELDS_REQUIRED,
    });
  }

  const newStatus = is_active ? 1 : 0;

  const checkQuery = `SELECT is_active FROM ORGANISATION WHERE org_id = ?`;

  db.get(checkQuery, [org_id], (err, org) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }

    if (!org) {
      return res.status(404).json({
        code: ADMIN_ERROR_CODES.ORGANISATION_NOT_FOUND,
        message: ADMIN_ERROR_MESSAGES.ADMIN_ORGANISATION_NOT_FOUND,
      });
    }

    if (org.is_active === newStatus) {
      return res.status(400).json({
        code: ADMIN_ERROR_CODES.ORG_ALREADY_IN_STATE,
        message: ADMIN_ERROR_MESSAGES.ADMIN_ORG_ALREADY_IN_STATE,
      });
    }

    const updateQuery = `
      UPDATE ORGANISATION 
      SET is_active = ? 
      WHERE org_id = ?
    `;

    db.run(updateQuery, [newStatus, org_id], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({
          code: ADMIN_ERROR_CODES.FAILED_TO_UPDATE_ORG_STATUS,
          message: ADMIN_ERROR_MESSAGES.ADMIN_FAILED_TO_UPDATE_ORG_STATUS,
          error: updateErr.message,
        });
      }

      const actionType = newStatus ? "ORG_ACTIVATED" : "ORG_DEACTIVATED";
      logAdminAction(admin_id, "ORGANISATION", actionType, null, org_id, null);

      return res.status(200).json({
        code: ADMIN_SUCCESS_CODES.ORG_STATUS_UPDATED,
        message: ADMIN_SUCCESS_MESSAGES.ADMIN_ORG_STATUS_UPDATED,
      });
    });
  });
};

// GET ADMIN AUDIT LOGS
const getAuditLogs = (req, res) => {
  const query = `
    SELECT 
      a.log_id,
      a.action_category,
      a.action_type,
      a.metadata,
      a.timestamp,

      -- Admin info
      u.first_name || ' ' || u.last_name AS admin_name,
      u.email AS admin_email,

      -- Target user info
      COALESCE(t.first_name || ' ' || t.last_name, '—') AS target_user_name,
      COALESCE(t.email, '—') AS target_user_email,

      -- Target organisation info
      COALESCE(o.name, '—') AS target_org_name,
      COALESCE(o.contact_email, '—') AS target_org_email

    FROM ADMIN_LOG a
    LEFT JOIN USER u ON a.admin_id = u.user_id
    LEFT JOIN USER t ON a.target_user_id = t.user_id
    LEFT JOIN ORGANISATION o ON a.target_org_id = o.org_id
    ORDER BY a.timestamp DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: ADMIN_ERROR_CODES.FAILED_TO_FETCH_LOGS,
        message: ADMIN_ERROR_MESSAGES.ADMIN_FAILED_TO_FETCH_LOGS,
        error: err.message,
      });
    }

    const formatted = rows.map((row) => {
      let metadata = null;
      if (row.metadata) {
        try {
          metadata = JSON.parse(row.metadata);
        } catch {
          metadata = null;
        }
      }

      return {
        ...row,
        metadata,
      };
    });

    return res.status(200).json(formatted);
  });
};

// ADD STAFF TO ORGANISATION
const addStaffToOrganisation = (req, res) => {
  const admin_id = req.user?.id;
  const { org_id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      code: ADMIN_ERROR_CODES.EMAIL_REQUIRED,
      message: ADMIN_ERROR_MESSAGES.ADMIN_EMAIL_REQUIRED,
    });
  }

  const checkOrgQuery = "SELECT is_active FROM ORGANISATION WHERE org_id = ?";

  db.get(checkOrgQuery, [org_id], (orgErr, org) => {
    if (orgErr) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: orgErr.message,
      });
    }

    if (!org) {
      return res.status(404).json({
        code: ADMIN_ERROR_CODES.ORGANISATION_NOT_FOUND,
        message: ADMIN_ERROR_MESSAGES.ADMIN_ORGANISATION_NOT_FOUND,
      });
    }

    if (org.is_active === 0) {
      return res.status(400).json({
        code: ADMIN_ERROR_CODES.ORG_INACTIVE_CANNOT_ADD_STAFF,
        message: ADMIN_ERROR_MESSAGES.ADMIN_ORG_INACTIVE_CANNOT_ADD_STAFF,
      });
    }

    const findUserQuery = `SELECT * FROM USER WHERE email = ?`;

    db.get(findUserQuery, [email], (userErr, user) => {
      if (userErr) {
        return res.status(500).json({
          code: GENERAL_ERROR_CODES.DATABASE_ERROR,
          message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
          error: userErr.message,
        });
      }

      if (!user) {
        return res.status(404).json({
          code: ADMIN_ERROR_CODES.USER_NOT_FOUND_FOR_STAFF,
          message: ADMIN_ERROR_MESSAGES.USER_NOT_FOUND,
        });
      }

      if (user.role === "Admin") {
        return res.status(400).json({
          code: ADMIN_ERROR_CODES.STAFF_CANNOT_BE_ADMIN,
          message: ADMIN_ERROR_MESSAGES.ADMIN_STAFF_CANNOT_BE_ADMIN,
        });
      }

      const checkStaffQuery =
        "SELECT * FROM ORGANISATION_STAFF WHERE user_id = ? AND is_active = 1";

      db.get(checkStaffQuery, [user.user_id], (staffErr, existingStaff) => {
        if (staffErr) {
          return res.status(500).json({
            code: GENERAL_ERROR_CODES.DATABASE_ERROR,
            message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
            error: staffErr.message,
          });
        }

        if (existingStaff) {
          return res.status(400).json({
            code: ADMIN_ERROR_CODES.USER_ALREADY_STAFF,
            message: ADMIN_ERROR_MESSAGES.ADMIN_USER_ALREADY_STAFF,
          });
        }

        const addUserQuery =
          "INSERT INTO ORGANISATION_STAFF (org_id, user_id, is_active) VALUES (?, ?, 1)";

        db.run(addUserQuery, [org_id, user.user_id], function (insertErr) {
          if (insertErr) {
            return res.status(500).json({
              code: ADMIN_ERROR_CODES.FAILED_TO_ADD_STAFF,
              message: ADMIN_ERROR_MESSAGES.ADMIN_FAILED_TO_ADD_STAFF,
              error: insertErr.message,
            });
          }

          const orgStaffId = this.lastID;

          const roleChanged = user.role !== "Staff";

          if (roleChanged) {
            const updateRoleQuery =
              "UPDATE USER SET role = 'Staff' WHERE user_id = ?";
            db.run(updateRoleQuery, [user.user_id]);
          }

          logAdminAction(
            admin_id,
            "MEMBERSHIP",
            "MEMBER_ADDED",
            user.user_id,
            org_id,
            { email }
          );

          if (roleChanged) {
            logAdminAction(
              admin_id,
              "USER",
              "USER_ROLE_CHANGED",
              user.user_id,
              null,
              { old_role: user.role, new_role: "Staff" }
            );
          }

          return res.status(201).json({
            code: ADMIN_SUCCESS_CODES.STAFF_ADDED,
            message: ADMIN_SUCCESS_MESSAGES.ADMIN_STAFF_ADDED,
            org_staff_id: orgStaffId,
          });
        });
      });
    });
  });
};

// GET STAFF FOR AN ORGANISATION
const getOrganisationStaff = (req, res) => {
  const { org_id } = req.params;

  const query = `
    SELECT 
      os.org_staff_id,
      os.user_id,
      os.staff_role,
      os.is_active,
      os.assigned_at,
      u.first_name,
      u.last_name,
      u.email
    FROM ORGANISATION_STAFF os
    JOIN USER u ON os.user_id = u.user_id
    WHERE os.org_id = ?
  `;

  db.all(query, [org_id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.status(200).json(rows);
  });
};

// REMOVE STAFF MEMBER FROM ORGANISATION
const removeOrganisationStaff = (req, res) => {
  const { org_id, user_id } = req.params;

  const deleteQuery =
    "DELETE FROM ORGANISATION_STAFF WHERE org_id = ? AND user_id = ?";

  db.run(deleteQuery, [org_id, user_id], function (err) {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        code: ADMIN_ERROR_CODES.STAFF_NOT_FOUND,
        message: ADMIN_ERROR_MESSAGES.ADMIN_STAFF_NOT_FOUND,
      });
    }

    const updateRoleQuery = `UPDATE USER SET role = 'Donor' WHERE user_id = ?`;

    db.run(updateRoleQuery, [user_id], (err2) => {
      if (err2) {
        return res.status(500).json({
          code: ADMIN_ERROR_CODES.FAILED_TO_REVERT_ROLE,
          message: ADMIN_ERROR_MESSAGES.ADMIN_FAILED_TO_REVERT_ROLE,
          error: err2.message,
        });
      }

      return res.status(200).json({
        code: ADMIN_SUCCESS_CODES.STAFF_REMOVED,
        message: ADMIN_SUCCESS_MESSAGES.ADMIN_STAFF_REMOVED,
      });
    });
  });
};

// METRICS

// SUMMARY
const getAdminSummary = (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM DONATION_TRANSACTION) AS total_donations,
      (SELECT COUNT(*) FROM DONATION_TRANSACTION WHERE status = 'Accepted') AS total_accepted,
      (SELECT COUNT(*) FROM DISTRIBUTION_RECORD) AS total_distributed,
      (SELECT IFNULL(SUM(beneficiaries), 0) FROM DISTRIBUTION_RECORD) AS total_beneficiaries,
      (SELECT IFNULL(SUM(co2_saved), 0) FROM DISTRIBUTION_RECORD) AS total_co2,
      (SELECT IFNULL(SUM(landfill_saved), 0) FROM DISTRIBUTION_RECORD) AS total_landfill,
      (SELECT COUNT(*) FROM USER) AS total_users,
      (SELECT COUNT(*) FROM USER WHERE role = 'Donor') AS total_donors,
      (SELECT COUNT(*) FROM USER WHERE role = 'Staff') AS total_staff,
      (SELECT COUNT(*) FROM USER WHERE role = 'Admin') AS total_admins,
      (SELECT COUNT(*) FROM USER WHERE is_active = 1) AS active_users,
      (SELECT COUNT(*) FROM USER WHERE is_active = 0) AS inactive_users
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.json(row);
  });
};

const getMonthlyActivity = (req, res) => {
  const query = `
    SELECT 
      month,
      SUM(submitted_count) AS submitted,
      SUM(accepted_count) AS accepted,
      SUM(distributed_count) AS distributed
    FROM (
      SELECT
        strftime('%Y-%m', submitted_at) AS month,
        COUNT(*) AS submitted_count,
        0 AS accepted_count,
        0 AS distributed_count
      FROM DONATION_TRANSACTION
      GROUP BY month

      UNION ALL

      SELECT
        strftime('%Y-%m', handled_at) AS month,
        0 AS submitted_count,
        COUNT(*) AS accepted_count,
        0 AS distributed_count
      FROM DONATION_TRANSACTION
      WHERE status = 'Accepted'
      GROUP BY month

      UNION ALL

      SELECT
        strftime('%Y-%m', distributed_at) AS month,
        0 AS submitted_count,
        0 AS accepted_count,
        COUNT(*) AS distributed_count
      FROM DISTRIBUTION_RECORD
      GROUP BY month
    )
    GROUP BY month
    ORDER BY month;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.json(rows);
  });
};

// ORGANISATION PERFORMANCE
const getOrgPerformance = (req, res) => {
  const query = `
    SELECT 
      o.org_id,
      o.name AS organisation_name,
      (SELECT COUNT(*) 
       FROM DONATION_TRANSACTION dt 
       WHERE dt.org_id = o.org_id AND dt.status = 'Accepted'
      ) AS accepted_donations,
      (SELECT COUNT(*) 
       FROM DISTRIBUTION_RECORD dr 
       WHERE dr.org_id = o.org_id
      ) AS distributed_items,
      (SELECT IFNULL(SUM(beneficiaries), 0)
       FROM DISTRIBUTION_RECORD dr 
       WHERE dr.org_id = o.org_id
      ) AS beneficiaries
    FROM ORGANISATION o
    WHERE o.is_active = 1
    ORDER BY distributed_items DESC;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.json(rows);
  });
};

// STATUS BREAKDOWN
const getStatusBreakdown = (req, res) => {
  const query = `
    SELECT status, COUNT(*) AS count
    FROM DONATION_TRANSACTION
    GROUP BY status;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.json(rows);
  });
};

// MONTHLY ENVIRONMENT DATA
const getEnvironmentMonthly = (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m', distributed_at) AS month,
      SUM(co2_saved) AS total_co2,
      SUM(landfill_saved) AS total_landfill
    FROM DISTRIBUTION_RECORD
    GROUP BY month
    ORDER BY month;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }
    return res.json(rows);
  });
};

// USER GROWTH CHART
const getUserGrowth = (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m', sign_up_date) AS month,
      COUNT(*) AS new_users
    FROM USER
    GROUP BY month
    ORDER BY month;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }

    return res.status(200).json(rows);
  });
};

// DONATION FUNNEL
const getDonationFunnel = (req, res) => {
  const query = `
    SELECT
      COUNT(*) AS submitted,
      SUM(status = 'Accepted' OR status = 'Declined') AS reviewed,
      SUM(status = 'Accepted') AS accepted,
      SUM(
        EXISTS(
          SELECT 1
          FROM DISTRIBUTION_RECORD DR
          WHERE DR.transaction_id = DT.transaction_id
        )
      ) AS distributed
    FROM DONATION_TRANSACTION DT;
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({
        code: GENERAL_ERROR_CODES.DATABASE_ERROR,
        message: GENERAL_ERROR_MESSAGES.DATABASE_ERROR,
        error: err.message,
      });
    }

    return res.status(200).json(row);
  });
};

// REPORTS
const generateAdminReport = async (req, res) => {
  const admin_id = req.user?.id;
  const {
    range,
    start,
    end,
    includeAudit = true,
    includeOrgs = true,
  } = req.body;

  try {
    const report = await generateReportData(
      range,
      start,
      end,
      includeAudit,
      includeOrgs
    );

    logAdminAction(admin_id, "SYSTEM", "REPORT_GENERATED", null, null, {
      range,
      start,
      end,
    });

    return res.status(200).json(report);
  } catch (err) {
    return res.status(500).json({
      code: ADMIN_ERROR_CODES.FAILED_TO_GENERATE_REPORT,
      message: ADMIN_ERROR_MESSAGES.ADMIN_FAILED_TO_GENERATE_REPORT,
      error: err.message,
    });
  }
};

// EXPORT AS FORMATTED PDF
const exportReportPdf = async (req, res) => {
  try {
    const admin_id = req.user?.id;
    const { range, start, end, includeAudit, includeOrgs } = req.body;

    const reportData = await generateReportData(
      range,
      start,
      end,
      includeAudit,
      includeOrgs
    );

    const safe = (v) => v ?? 0;
    const sanitize = (input) => {
      if (input === null || input === undefined) return "";
      return String(input).replace(/[^\x00-\x7F]/g, "?");
    };

    const pdf = await PDFDocument.create();
    let page = pdf.addPage();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const margin = 40;

    let y = pageHeight - margin;

    const checkY = (lineHeight = 20) => {
      if (y - lineHeight < margin) {
        page = pdf.addPage();
        y = page.getHeight() - margin;
        return true;
      }
      return false;
    };

    const writeText = (text, size = 12) => {
      text = sanitize(String(text));
      checkY(size + 6);
      page.drawText(text, { x: margin, y, size, font });
      y -= size + 6;
    };

    const sectionHeader = (label) => {
      writeText("");
      writeText(label, 16);
      writeText("----------------------------------------------", 10);
      y -= 4;
    };

    const writeTable = (rows) => {
      rows.forEach(([key, value]) => {
        checkY();
        const cleanKey = sanitize(key);
        const cleanValue = sanitize(value);

        page.drawText(cleanKey, {
          x: margin,
          y,
          size: 11,
          font,
        });

        page.drawText(cleanValue, {
          x: margin + 250,
          y,
          size: 11,
          font,
        });

        y -= 18;
      });
    };

    // HEADER
    writeText("SustainWear - Admin Report", 18);
    writeText(`Generated: ${new Date().toLocaleDateString()}`, 12);
    writeText(
      `Reporting Period: ${reportData.dateRange.start} to ${reportData.dateRange.end}`,
      12
    );

    // SUMMARY SECTION
    sectionHeader("SUMMARY");

    writeTable([
      ["Total Submitted", safe(reportData.summary.total_submitted)],
      ["Accepted", safe(reportData.summary.accepted)],
      ["Declined", safe(reportData.summary.declined)],
    ]);

    // DISTRIBUTION SECTION
    sectionHeader("DISTRIBUTION SUMMARY");

    writeTable([
      ["Distributed", safe(reportData.distributions.distributed)],
      ["CO2 Saved (kg)", safe(reportData.distributions.co2)],
      ["Landfill Saved (kg)", safe(reportData.distributions.landfill)],
      ["Beneficiaries", safe(reportData.distributions.beneficiaries)],
    ]);

    // DONATION FUNNEL
    sectionHeader("DONATION FUNNEL");

    writeTable([
      ["Submitted", safe(reportData.donationFunnel.submitted)],
      ["Reviewed", safe(reportData.donationFunnel.reviewed)],
      ["Accepted", safe(reportData.donationFunnel.accepted)],
      ["Distributed", safe(reportData.donationFunnel.distributed)],
    ]);

    // ORG PERFORMANCE (Optional)
    if (includeOrgs && reportData.organisations.length > 0) {
      sectionHeader("ORGANISATION PERFORMANCE");

      reportData.organisations.forEach((org) => {
        writeText(`${sanitize(org.name)}`, 13);

        writeTable([
          ["Received", safe(org.received)],
          ["Accepted", safe(org.accepted)],
          ["Distributed", safe(org.distributed)],
          ["CO2 Saved", safe(org.co2)],
          ["Beneficiaries", safe(org.beneficiaries)],
        ]);

        writeText("");
      });
    }

    // USER ACTIVITY
    sectionHeader("USER ACTIVITY – STAFF");

    if (reportData.userActivity.staff.length === 0) {
      writeText("No staff activity recorded.");
    } else {
      reportData.userActivity.staff.forEach((s) => {
        writeTable([[s.staff_name, safe(s.handled)]]);
      });
    }

    sectionHeader("USER ACTIVITY – DONORS");

    if (reportData.userActivity.donors.length === 0) {
      writeText("No donor activity recorded.");
    } else {
      reportData.userActivity.donors.forEach((d) => {
        writeTable([[d.donor_name, safe(d.donations)]]);
      });
    }

    // AUDIT SUMMARY (Optional)
    if (includeAudit) {
      sectionHeader("ADMIN AUDIT SUMMARY");

      if (reportData.auditSummary.length === 0) {
        writeText("No admin actions recorded.");
      } else {
        reportData.auditSummary.forEach((log) => {
          writeTable([
            [`${log.action_category}:${log.action_type}`, safe(log.count)],
          ]);
        });
      }
    }

    const pdfBytes = await pdf.save();

    logAdminAction(admin_id, "SYSTEM", "REPORT_EXPORTED_PDF", null, null, {
      range,
      start,
      end,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    return res.status(500).json({
      code: ADMIN_ERROR_CODES.FAILED_TO_EXPORT_REPORT_PDF,
      message: ADMIN_ERROR_MESSAGES.ADMIN_FAILED_TO_EXPORT_REPORT_PDF,
      error: err.message,
    });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  addOrganisation,
  getAllOrganisations,
  updateOrganisationStatus,
  getAuditLogs,
  addStaffToOrganisation,
  getOrganisationStaff,
  removeOrganisationStaff,
  getAdminSummary,
  getMonthlyActivity,
  getOrgPerformance,
  getStatusBreakdown,
  getEnvironmentMonthly,
  getUserGrowth,
  getDonationFunnel,
  generateAdminReport,
  exportReportPdf,
};