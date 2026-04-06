const pool = require("../db/pool");

// GET /api/items  - fetch all items
async function getAllItems(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM items ORDER BY created_at ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllItems error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
}

// Generate next item_code like IT00001
async function generateItemCode() {
  const result = await pool.query(`
    SELECT item_code 
    FROM items 
    ORDER BY item_code DESC 
    LIMIT 1
  `);

  let nextCode = "IT00001";

  if (result.rows.length > 0) {
    const lastCode = result.rows[0].item_code;
    const num = parseInt(lastCode.substring(2)) + 1;
    nextCode = "IT" + num.toString().padStart(5, "0");
  }

  return nextCode;
}

// POST /api/items  - create a new item
async function createItem(req, res) {
  const { name, selling_price, status } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Item name is required" });
  }

  if (selling_price === undefined || selling_price === null || selling_price === "") {
    return res.status(400).json({ success: false, message: "Selling price is required" });
  }

  const price = parseFloat(selling_price);
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ success: false, message: "Selling price must be a valid non-negative number" });
  }

  if (!status || !["Active", "In-Active"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be Active or In-Active" });
  }

  try {
    const item_code = await generateItemCode();

    const result = await pool.query(
      `INSERT INTO items (item_code, name, selling_price, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [item_code, name.trim(), price, status]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Item created successfully"
    });

  } catch (err) {
    console.error("createItem error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create item" });
  }
}

module.exports = { getAllItems, createItem };