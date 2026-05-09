// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const authRoutes = require('./routes/auth.cjs');
// const depositRoutes = require('./routes/deposit.cjs');
// const adminRoutes = require('./routes/admin.cjs');

// const app = express();
// const port = process.env.PORT || 5000;
// const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

// app.use(cors({ origin: true, credentials: true }));
// app.use(express.json());
// app.get('/api/health', (_req, res) => res.json({ ok: true, mongoUri }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api/auth', authRoutes);
// app.use('/api', depositRoutes);
// app.use('/admin', adminRoutes);

// app.use((error, _req, res, _next) => {
//   console.error(error);
//   res.status(500).json({ message: error.message || 'Internal server error' });
// });

// mongoose
//   .connect(mongoUri)
//   .then(() => {
//     app.listen(port, () => console.log(`API server running on port ${port}`));
//   })
//   .catch((error) => {
//     console.error('MongoDB connection failed', error);
//     process.exit(1);
//   });

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.cjs");
const depositRoutes = require("./routes/deposit.cjs");
const adminRoutes = require("./routes/admin.cjs");

const app = express();

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Server running successfully",
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", depositRoutes);
app.use("/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || "Internal server error",
  });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });