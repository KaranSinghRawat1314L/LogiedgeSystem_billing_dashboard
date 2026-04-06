const { Pool } = require("pg");
require("dotenv").config();

// Create a connection pool so we reuse DB connections
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "logedge_db",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: 10,                      // max 10 simultaneous connections
  idleTimeoutMillis: 30000,     // close idle connections after 30s
  connectionTimeoutMillis: 2000 // fail fast if DB is down
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error("Could not connect to PostgreSQL:", err.message);
  } else {
    console.log("Connected to PostgreSQL database:", process.env.DB_NAME || "logedge_db");
    release();
  }
});

module.exports = pool;
