require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { verifyToken, verifyAdmin } = require("./middlewares/middlewares");
const app = express();

// CORS configuration for development and production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_DEV_URL,
  process.env.FRONTEND_DEPLOYMENT_URL,
  process.env.BACKEND_URL,
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim()),
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Only apply CORS to API requests so same-origin static assets can always load.
app.use("/api", cors(corsOptions));

// routes
app.use("/api", require("./routes/userRoutes"));        // authentication routes
app.use("/api/donor", require("./routes/donorRoutes")); // donor specific routes
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve static files from uploads folder
app.use("/api/orgs", require("./routes/orgRoutes"));    // organisation specific routes
app.use("/api/admin", verifyToken, verifyAdmin, require("./routes/adminRoutes")); // admin specific routes

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

// serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Express 5 requires a named wildcard for SPA catch-all routes.
  app.get("/{*path}", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
