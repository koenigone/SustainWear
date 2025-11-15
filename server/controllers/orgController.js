const db = require("../config/db");

// GET STAFF'S ORGANISATION INFO
const getStaffOrganisation = (user_id, callback) => {
  const q = `
    SELECT O.org_id, O.name 
    FROM ORGANISATION O
    JOIN ORGANISATION_STAFF OS ON O.org_id = OS.org_id
    WHERE OS.user_id = ? AND OS.is_active = 1
  `;
  db.get(q, [user_id], callback);
};

module.exports = { 
  getStaffOrganisation,
};