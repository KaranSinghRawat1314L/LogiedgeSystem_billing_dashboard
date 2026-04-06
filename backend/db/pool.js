require("dotenv").config();

const { Pool } = require("pg");

const isProduction = process.env.DATABASE_URL;

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "logedge_db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      }
);

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Could not connect to PostgreSQL:", err.message);
  } else {
    console.log(
      "Connected to PostgreSQL database:",
      isProduction ? "Neon DB" : process.env.DB_NAME || "logedge_db"
    );
    release();
  }
});

module.exports = pool;
