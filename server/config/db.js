const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../SustainWearDB.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    db.run("PRAGMA foreign_keys = ON;");
    console.log("Connected to SustainWear SQLite database");
  }
});

db.serialize(() => { // seriealizing opoerations
  console.log("Database is running in serialized mode");
});

module.exports = db;