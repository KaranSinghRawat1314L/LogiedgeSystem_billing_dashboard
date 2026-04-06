const pool = require("../db/pool");

// GET /api/customers  - fetch all customers
async function getAllCustomers(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllCustomers error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch customers" });
  }
}

// POST /api/customers  - create a new customer
async function createCustomer(req, res) {
  const { name, address, pan_number, gst_number, status } = req.body;

  // Basic validation
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Customer name is required" });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ success: false, message: "Customer address is required" });
  }
  if (!pan_number || !pan_number.trim()) {
    return res.status(400).json({ success: false, message: "PAN card number is required" });
  }
  if (!status || !["Active", "In-Active"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be Active or In-Active" });
  }

  try {
    const idResult = await pool.query(`
      SELECT cust_id 
      FROM customers 
      ORDER BY cust_id DESC 
      LIMIT 1
    `);

    let nextId = "C00001";

    if (idResult.rows.length > 0) {
      const lastId = idResult.rows[0].cust_id;
      const num = parseInt(lastId.substring(1)) + 1;
      nextId = "C" + num.toString().padStart(5, "0");
    }

    const result = await pool.query(
      `INSERT INTO customers 
       (cust_id, name, address, pan_number, gst_number, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        nextId,
        name.trim(),
        address.trim(),
        pan_number.trim().toUpperCase(),
        gst_number ? gst_number.trim().toUpperCase() : null,
        status
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Customer created successfully"
    });

  } catch (err) {
    console.error("createCustomer error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create customer" });
  }
}

module.exports = { getAllCustomers, createCustomer };