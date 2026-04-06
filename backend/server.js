const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const customerRoutes = require("./routes/customers");
const itemRoutes     = require("./routes/items");
const invoiceRoutes  = require("./routes/invoices");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────
// CORS — allow your Vercel frontend + localhost for development
//
// On Render, set this environment variable:
//   FRONTEND_URL = https://logiedge-system-billing-dashboard.vercel.app
//
// You can add multiple origins separated by commas:
//   FRONTEND_URL = https://your-app.vercel.app,https://your-custom-domain.com
// ─────────────────────────────────────────────────────────────

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Add any origins from the FRONTEND_URL env variable
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL
    .split(",")
    .map((o) => o.trim().replace(/\/$/, "")); // remove any trailing slash
  allowedOrigins.push(...envOrigins);
}

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin header (Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, ""); // remove trailing slash

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.error("CORS blocked for origin:", origin);
      return callback(new Error("CORS: origin not allowed — " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Handle preflight OPTIONS requests explicitly
app.options("*", cors());

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — origin: ${req.headers.origin || "none"}`);
  next();
});

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
app.use("/api/customers", customerRoutes);
app.use("/api/items",     itemRoutes);
app.use("/api/invoices",  invoiceRoutes);

// Health check — open this in browser to confirm backend is alive
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LogiEdge API is running",
    timestamp: new Date().toISOString(),
    allowed_origins: allowedOrigins,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`LogiEdge Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
