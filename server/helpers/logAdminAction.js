const db = require("../config/db");

/**
 * Logs an admin action in the audit log.
 *
 * @param {number} admin_id - ID of the admin performing the action
 * @param {string} action_category - High-level category ('USER', 'ORGANISATION', 'MEMBERSHIP', 'SYSTEM')
 * @param {string} action_type - Specific action ('MEMBER_ADDED', 'USER_UPDATED', etc.)
 * @param {number|null} target_user_id - Optional affected user
 * @param {number|null} target_org_id - Optional affected organisation
 * @param {object|null} metadata - Additional structured info (stored as JSON)
 */
const logAdminAction = (
  admin_id,
  action_category,
  action_type,
  target_user_id = null,
  target_org_id = null,
  metadata = null
) => {
  const query = `
    INSERT INTO ADMIN_LOG (
      admin_id,
      action_category,
      action_type,
      target_user_id,
      target_org_id,
      metadata,
      timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(
    query,
    [
      admin_id,
      action_category,
      action_type,
      target_user_id,
      target_org_id,
      metadata ? JSON.stringify(metadata) : null,
    ],
    (err) => {
      if (err) {
        console.error("Audit log insert error:", err.message);
      }
    }
  );
};

module.exports = { logAdminAction };