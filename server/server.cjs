// Load env as early as possible
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ====== Basic middleware ======
app.use(express.json({ limit: "2mb" }));

// ====== CORS ======
// Use an allowlist if CLIENT_ORIGIN is provided.
// Example: CLIENT_ORIGIN="https://your-frontend.com,http://localhost:5173"
// Notes:
// - We must not use `*` with `credentials: true`.
// - We allow requests without Origin header (curl/postman) always.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
const ENV = process.env.NODE_ENV || 'development';

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, Postman, Render health checks)
    if (!origin) return callback(null, true);

    // Build allowed list: explicit CLIENT_ORIGIN env var + dev origins
    const allowed = [
      ...(CLIENT_ORIGIN ? CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean) : []),
      ...devOrigins,
    ];

    if (allowed.includes(origin)) return callback(null, true);

    // In development, allow everything for convenience
    if (ENV === 'development') return callback(null, true);

    return callback(new Error(`CORS blocked: ${origin}. Add it to CLIENT_ORIGIN env var on Render.`));
  },
};

app.use(cors(corsOptions));


// ====== Routes ======
// Keep existing folder structure, just mount them properly.
const authRoutes = require("./routes/auth.cjs");
const adminRoutes = require("./routes/admin.cjs");
const depositRoutes = require("./routes/deposit.cjs");

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", depositRoutes);

// Serve uploaded screenshots so frontend can access /uploads/... paths
const path = require("path");
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ====== Config ======
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing MongoDB connection string. Set MONGODB_URI (preferred) or MONGO_URI.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET. Auth middleware will fail.");
  process.exit(1);
}

// ====== Mongo connection ======
// Use modern connection options and clear logs.
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server Running On ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error ❌", err);
    process.exit(1);
  });

// Basic error handler (must be last)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Express error:", err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});
