const db = require("../config/db");

function sendDonorNotification(user_id, title, message, related_request_id = null) {
  const q = `
    INSERT INTO NOTIFICATION (user_id, title, message, related_request_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(q, [user_id, title, message, related_request_id], (err) => {
    if (err) console.error("Notification Error:", err.message);
  });
}

module.exports = { sendDonorNotification };