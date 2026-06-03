require("dotenv").config();
const express = require("express");
const cors    = require("cors");

// Routes
const authRoutes    = require("./routes/auth");
const studentRoutes = require("./routes/students");
const staffRoutes   = require("./routes/staffs");
const itemRoutes    = require("./routes/items");
const borrowRoutes  = require("./routes/borrows");

// Init DB connection (logs success/failure on startup)
require("./config/db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/staffs",   staffRoutes);
app.use("/api/items",    itemRoutes);
app.use("/api/borrows",  borrowRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Setec API", time: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀  Setec API running at http://localhost:${PORT}`);
  console.log(`📋  Endpoints:`);
  console.log(`    POST   /api/auth/staff/login`);
  console.log(`    POST   /api/auth/student/login`);
  console.log(`    GET    /api/auth/me`);
  console.log(`    GET    /api/students`);
  console.log(`    GET    /api/staffs`);
  console.log(`    GET    /api/items`);
  console.log(`    GET    /api/borrows`);
  console.log(`    GET    /api/borrows/stats\n`);
});
