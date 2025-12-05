const bcrypt = require("bcrypt");
const db = require("../config/db");

/*
 THIS SCRIPT GENERATES 100 USERS WITH THEIR DATA
 TO RUN THE SCRIPT, OPEN THE TERMINAL AND INSERT THE FOLLOWING COMMANDS
 1- cd server
 2- node scripts/insertUsersData.js
*/

// HELPERS
const firstNames = [
  "Adam",
  "Sarah",
  "Liam",
  "Noah",
  "Mia",
  "Zara",
  "Owen",
  "Layla",
  "Amir",
  "Jonas",
  "Ethan",
  "Nora",
];
const lastNames = [
  "Smith",
  "Mohamed",
  "Williams",
  "Ali",
  "Anderson",
  "Brown",
  "Johnson",
  "Taylor",
  "Harris",
  "Martin",
];
const categories = [
  "Shirt",
  "Jacket",
  "Trousers",
  "Shoes",
  "Hat",
  "Dress",
  "Coat",
];
const conditions = [
  "Brand New",
  "Like New",
  "Gently Used",
  "Used / Good Condition",
  "Needs Repair",
];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const genders = ["Male", "Female"];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

(async function runSeed() {
  console.log("\nStarting test data generation...\n");

  const passwordHash = await bcrypt.hash("password123", 10);

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // CREATE 100 RANDOM DONORS
    const createUser = db.prepare(`
      INSERT INTO USER (first_name, last_name, email, password, role, sign_up_date)
      VALUES (?, ?, ?, ?, 'Donor', datetime('now'))
    `);

    let userIds = [];

    for (let i = 0; i < 100; i++) {
      const fn = random(firstNames);
      const ln = random(lastNames);
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@test.com`;

      createUser.run([fn, ln, email, passwordHash], function () {
        userIds.push(this.lastID);
      });
    }

    createUser.finalize();

    // GENERATE DONATIONS FOR EACH USER
    const donationStmt = db.prepare(`
      INSERT INTO DONATION_TRANSACTION
      (donor_id, org_id, item_name, category, item_condition, size, gender, photo_url, description, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    let donationIds = [];

    for (const donor of userIds) {
      const donationCount = randomInt(2, 12);

      for (let i = 0; i < donationCount; i++) {
        let status = "Pending";
        const r = Math.random();
        if (r < 0.6) status = "Accepted";
        else if (r < 0.85) status = "Pending";
        else status = "Declined";

        donationStmt.run(
          donor,
          1, // org_id (use existing organisation)
          `${random(categories)} Item`,
          random(categories),
          random(conditions),
          random(sizes),
          random(genders),
          "/uploads/default.jpg",
          "Auto-generated test donation",
          status,
          `-${randomInt(1, 90)} days`,
          function () {
            donationIds.push({ id: this.lastID, donor_id: donor, status });
          }
        );
      }
    }

    donationStmt.finalize();

    // INVENTORY + DISTRIBUTION FOR ACCEPTED DONATIONS
    const invStmt = db.prepare(`
      INSERT INTO INVENTORY
      (org_id, item_name, category, item_condition, size, gender, photo_url, description, transaction_id)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const distStmt = db.prepare(`
      INSERT INTO DISTRIBUTION_RECORD
      (inv_id, transaction_id, org_id, quantity_distributed, beneficiary_group, handled_by_staff_id,
       co2_saved, landfill_saved, beneficiaries)
      VALUES (?, ?, 1, 1, ?, 1, ?, ?, ?)
    `);

    for (const d of donationIds) {
      if (d.status !== "Accepted") continue;

      const invData = [
        `${random(categories)} Item`,
        random(categories),
        random(conditions),
        random(sizes),
        random(genders),
        "/uploads/default.jpg",
        "Auto-generated",
        d.id,
      ];

      invStmt.run(invData, function () {
        const invId = this.lastID;
        const co2 = randomInt(1, 10);
        const lf = randomInt(1, 5);
        const ben = randomInt(1, 3);

        distStmt.run(
          invId,
          d.id,
          `Community Group ${randomInt(1, 5)}`,
          co2,
          lf,
          ben
        );
      });
    }

    invStmt.finalize();
    distStmt.finalize();

    db.run("COMMIT", () => {
      console.log("100 donors added");
      console.log("Donation history created");
      console.log("Accepted donations distributed with sustainability impact\n");
    });
  });
})();