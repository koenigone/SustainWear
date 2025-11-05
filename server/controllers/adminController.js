const db = require("../config/db");

// UPDATE USER ROLE (Admin only)
const updateUser = (req, res) => {
  const { user_id, role, is_active } = req.body;

  if (role !== "Donor" && role !== "Admin") { // only switch between admin and donor roles
    return res.status(400).json({ errMessage: "Invalid role. Only Donor or Admin are allowed." });
  }

  const query = `UPDATE USER SET role = ?, is_active = ? WHERE user_id = ?`;

  db.run(query, [role, is_active, user_id], function (err) {
    if (err) return res.status(500).json({ errMessage: "Database error", error: err.message });
    res.status(200).json({ message: "User updated successfully" });
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

// CREATE NEW ORGANISATION
const createOrganisation = (req, res) => {
  const { name, description, manager_email } = req.body;

  if (!name || !manager_email) {
    return res.status(400).json({
      errMessage: "Organisation name and manager email are required",
    });
  }

  // find the manager by email
  const findUserQuery = `SELECT user_id, role FROM USER WHERE email = ?`;

  db.get(findUserQuery, [manager_email], (err, user) => {
    if (err) return res.status(500).json({
        errMessage: "Database error while finding manager",
        error: err.message,
      });

    if (!user) return res.status(404).json({ errMessage: "No user found with this email" });

    // promote to Staff if needed (user could already be a staff for another org)
    const updateRoleQuery = `UPDATE USER SET role = 'Staff' WHERE user_id = ? AND role = 'Donor'`;
    db.run(updateRoleQuery, [user.user_id]);

    const orgQuery = `INSERT INTO ORGANISATION (name, description) VALUES (?, ?)`;
    db.run(orgQuery, [name, description || null], function (err2) {
      if (err2) return res.status(500).json({ errMessage: "Failed to add organisation", error: err2.message });

      const org_id = this.lastID;

      // add as Manager in ORGANISATION_STAFF table
      const assignQuery = `
        INSERT INTO ORGANISATION_STAFF (org_id, user_id, role)
        VALUES (?, ?, 'Manager')
      `;

      db.run(assignQuery, [org_id, user.user_id], (err3) => {
        if (err3) return res.status(500).json({
            errMessage: "Organisation created but manager assignment failed",
            error: err3.message,
          });

        res.status(201).json({ message: "Organisation created successfully", org_id });
      });
    });
  });
};

// GET ALL ORGANISATIONS
const getOrganisations = (req, res) => {
  const query = `
    SELECT 
      o.org_id,
      o.name,
      o.description,
      o.created_at,
      u.first_name || ' ' || u.last_name AS manager_name
    FROM ORGANISATION o
    LEFT JOIN ORGANISATION_STAFF os ON o.org_id = os.org_id AND os.role = 'Manager'
    LEFT JOIN USER u ON os.user_id = u.user_id
    ORDER BY o.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ 
      errMessage: "Database error",
      error: err.message
    });
    res.status(200).json(rows);
  });
};

// UPDATE ORGANISATION
const updateOrganisation = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const query = `UPDATE ORGANISATION SET name = ?, description = ? WHERE org_id = ?`;
  db.run(query, [name, description, id], function (err) {
    if (err) return res.status(500).json({ errMessage: "Failed to update organisation", error: err.message });
    res.status(200).json({ message: "Organisation updated successfully" });
  });
};

// DELETE ORGANISATION
const deleteOrganisation = (req, res) => {
  const { id } = req.params;

  db.serialize(() => {
    db.run(`DELETE FROM ORGANISATION_STAFF WHERE org_id = ?`, [id]);
    db.run(`DELETE FROM INVENTORY WHERE org_id = ?`, [id]);
    db.run(`DELETE FROM ORGANISATION WHERE org_id = ?`, [id], function (err) {
      if (err) return res.status(500).json({ errMessage: "Failed to delete organisation", error: err.message });
      res.status(200).json({ message: "Organisation deleted successfully" });
    });
  });
};

module.exports = {
  getAllUsers,
  updateUser,
  createOrganisation,
  getOrganisations,
  updateOrganisation,
  deleteOrganisation,
};