const db = require("../config/db");

function sendDonorNotification(user_id, title, message, related_transaction_id = null) {
  const q = `
    INSERT INTO NOTIFICATION (user_id, title, message, related_transaction_id)
    VALUES (?, ?, ?, ?)
  `;

  db.run(q, [user_id, title, message, related_transaction_id], function (err) {
    if (err) {
      console.error("Notification Insert Error:", err.message);
    } else {
      console.log("Notification inserted with ID:", this.lastID);
    }
  });
}

module.exports = { sendDonorNotification };