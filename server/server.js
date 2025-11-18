require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { verifyToken, verifyAdmin } = require("./middlewares/middlewares");
const app = express();

// CORS configuration for development and production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true
    : process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/api", require("./routes/userRoutes"));        // authentication routes
app.use("/api/donor", require("./routes/donorRoutes")); // donor specific routes
app.use("/uploads", express.static("uploads"));         // serve static files from uploads folder
app.use("/api/", require("./routes/orgRoutes"));        // organisation specific routes
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

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// port
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});