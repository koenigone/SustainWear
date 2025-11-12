const db = require("../config/db");

/**
 * Logs an admin action in the audit log.
 * @param {number} admin_id - ID of the admin performing the action
 * @param {string} action - Description of the action
 * @param {number|null} target_user_id - Optional target user ID
 * @param {number|null} target_org_id - Optional target organisation ID
 */
const adminAuditLogger = (admin_id, action, target_user_id = null, target_org_id = null) => {
  const query = `
    INSERT INTO AUDIT_LOG (admin_id, action, target_user_id, target_org_id, timestamp)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  db.run(query, [admin_id, action, target_user_id, target_org_id], (err) => {
    if (err) console.error("Audit log insert error:", err.message);
  });
}

module.exports = { adminAuditLogger };