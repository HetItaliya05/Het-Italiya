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
const PORT = process.env.PORT || 5000;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.cjs");
const depositRoutes = require("./routes/deposit.cjs");
const adminRoutes = require("./routes/admin.cjs");

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Support both env var names for backward compatibility.
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const corsOrigin = process.env.CORS_ORIGIN;

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

assertEnv("MONGODB_URI (or MONGO_URI)", mongoUri);
assertEnv("JWT_SECRET", JWT_SECRET);

app.use(
  cors({
    origin: corsOrigin
      ? corsOrigin
      : (origin, cb) => {
          // In production (Render/Vercel), origin will usually be https://<vercel-domain>
          // If origin header is missing (e.g. curl), allow it.
          if (!origin) return cb(null, true);
          return cb(null, true);
        },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

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

// Error handling (production-safe)
app.use((error, _req, res, _next) => {
  console.error("[API Error]", error);

  if (res.headersSent) {
    return;
  }

  const status = Number(error.statusCode || error.status || 500);
  const message = error.message || "Internal server error";
  res.status(status).json({ message });
});

async function connectMongoWithRetry(uri, maxRetries = 10, delayMs = 5000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt += 1;
    try {
      console.log(`[MongoDB] Connecting (attempt ${attempt}/${maxRetries})...`);
      // Mongoose 9 defaults are generally fine; keep timeouts explicit.
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log("[MongoDB] Connected");
      return;
    } catch (err) {
      console.error("[MongoDB] Connection failed:", err?.message || err);
      if (attempt >= maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

connectMongoWithRetry(mongoUri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[API] Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    // Do not silently crash without context.
    console.error("[MongoDB] Fatal: could not connect after retries. Not starting API.", error);
  });
