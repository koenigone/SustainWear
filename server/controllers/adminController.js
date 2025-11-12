const db = require("../config/db");
const { adminAuditLogger } = require("../helpers/adminAuditLogger");
const { validateOrganisationInput } = require("../helpers/validations");

// UPDATE USER ROLE (Admin only)
const updateUser = (req, res) => {
  const { user_id, role, is_active } = req.body;
  const admin_id = req.user?.id;

  if (!user_id)
    return res.status(400).json({ errMessage: "User ID is required" });

  if (role !== "Donor" && role !== "Admin") {
    return res.status(400).json({
      errMessage: "Invalid role. Only Donor or Admin are allowed.",
    });
  }

  const normalizedStatus = Number(is_active);

  // check current role
  const checkUserQuery = `SELECT role, is_active FROM USER WHERE user_id = ?`;

  db.get(checkUserQuery, [user_id], (err, user) => {
    if (err) return res.status(500).json({ errMessage: "Database error", error: err.message });
    if (!user) return res.status(404).json({ errMessage: "User not found" });

    if (user.role === "Admin" && normalizedStatus === 0) {
      return res.status(403).json({ errMessage: "You cannot deactivate another admin." });
    }

    if (user.role === "Admin" && role === "Donor") {
      return res.status(403).json({ errMessage: "You cannot demote another admin." });
    }

    // continue with updating
    const updateQuery = `UPDATE USER SET role = ?, is_active = ? WHERE user_id = ?`;

    db.run(updateQuery, [role, is_active, user_id], (updateErr) => {
      if (updateErr)
        return res.status(500).json({
          errMessage: "Database error",
          error: updateErr.message,
        });

      // decide action for log action message
      let action = "";

      // action: activated or deactivated
      if (typeof is_active === "boolean" || typeof is_active === "number") {
        if (is_active === 1 || is_active === true)
          action = "Activated user account";
        else if (is_active === 0 || is_active === false)
          action = "Deactivated user account";
      }

      // action: Promotion
      if (role === "Admin" && user.role !== "Admin") action = "Promoted user to Admin";

      adminAuditLogger(admin_id, action, user_id); // add action to admin log

      res.status(200).json({ message: "User updated successfully" });
    });
  });
};

// GET ALL USERS
const getAllUsers = (req, res) => {
  const query = `SELECT user_id, first_name, last_name, email, role, is_active FROM USER`;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ errMessage: "Database error", error: err.message });
    res.status(200).json(rows);
  });
};

// ADD NEW ORGANISATION
const addOrganisation = (req, res) => {
  const admin_id = req.user?.id;
  const { name, description, street_name, post_code, city, contact_email } = req.body;

  const validationError = validateOrganisationInput(req.body);
  if (validationError) return res.status(400).json({ errMessage: validationError });

  const query = `
    INSERT INTO ORGANISATION (name, description, street_name, post_code, city, contact_email)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, description, street_name, post_code, city, contact_email],
    (err) => {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed: ORGANISATION.name")) {
          return res.status(400).json({
            errMessage: "An organisation with this name already exists. Please choose a different name.",
          });
        }

        return res.status(500).json({
          errMessage: "Failed to add organisation",
          error: err.message,
        });
      }

      const action = "Organisation created";
      const orgId = this.lastID;
      adminAuditLogger(admin_id, action, null, orgId); // add action to admin log

      res.status(201).json({
        message: "Organisation added successfully",
        org_id: orgId,
      });
    }
  );
};

// GET ALL ORGANISATIONS
const getAllOrganisations = (req, res) => {
  const query = `SELECT * FROM ORGANISATION ORDER BY created_at DESC`;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ errMessage: "Database error", error: err.message });
    res.status(200).json(rows);
  });
};

// UPDATE ORGANISATION STATUS
const updateOrganisationStatus = (req, res) => {
  const { org_id, is_active } = req.body;
  const admin_id = req.user?.id;

  if (typeof is_active === "undefined")
    return res.status(400).json({ errMessage: "Missing activation status" });

  const query = `UPDATE ORGANISATION SET is_active = ? WHERE org_id = ?`;

  db.run(query, [is_active ? 1 : 0, org_id], (err) => {
    if (err)
      return res.status(500).json({ errMessage: "Failed to update organisation", error: err.message });

    const action = is_active ? "Organisation activated" : "Organisation deactivated";
    adminAuditLogger(admin_id, action, null, org_id); // add action to admin log

    res.status(200).json({ message: "Organisation status updated successfully" });
  });
};

// DELETE ORGANISATION
const deleteOrganisation = (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM ORGANISATION WHERE org_id = ?`;
  const admin_id = req.user?.id;

  db.run(query, [id], (err) => {
    if (err)
      return res.status(500).json({ errMessage: "Failed to delete organisation", error: err.message });

    const action = "Organisation deleted";
    adminAuditLogger(admin_id, action, null, id); // add action to admin log

    res.status(200).json({ message: "Organisation deleted successfully" });
  });
};

// GET ADMIN AUDIT LOGS
const getAuditLogs = (req, res) => {
  const query = `
    SELECT 
      a.log_id,
      a.action,
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

    FROM AUDIT_LOG a
    LEFT JOIN USER u ON a.admin_id = u.user_id
    LEFT JOIN USER t ON a.target_user_id = t.user_id
    LEFT JOIN ORGANISATION o ON a.target_org_id = o.org_id
    ORDER BY a.timestamp DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        errMessage: "Database error while fetching logs",
        error: err.message,
      });
    }

    res.status(200).json(rows);
  });
};

module.exports = {
  getAllUsers,
  updateUser,
  addOrganisation,
  getAllOrganisations,
  updateOrganisationStatus,
  deleteOrganisation,
  getAuditLogs,
};