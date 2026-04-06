const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const customerRoutes = require("./routes/customers");
const itemRoutes     = require("./routes/items");
const invoiceRoutes  = require("./routes/invoices");

const app  = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Simple request logger (useful for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ---- Routes ----
app.use("/api/customers", customerRoutes);
app.use("/api/items",     itemRoutes);
app.use("/api/invoices",  invoiceRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "LogiEdge API running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`LogiEdge Backend running on http://localhost:${PORT}`);
});
