const pool = require("../db/pool");

// Generate a unique invoice ID like INVC224830
async function generateInvoiceId() {
  let invoiceId;
  let isUnique = false;

  while (!isUnique) {
    const digits = Math.floor(100000 + Math.random() * 900000);
    invoiceId = "INVC" + digits;

    const check = await pool.query(
      "SELECT id FROM invoices WHERE invoice_id = $1",
      [invoiceId]
    );

    if (check.rows.length === 0) {
      isUnique = true;
    }
  }
  return invoiceId;
}

// GET ALL INVOICES
async function getAllInvoices(req, res) {
  try {
    const invoicesResult = await pool.query(`
      SELECT
        inv.id,
        inv.invoice_id,
        inv.customer_id,
        c.name AS customer_name,
        inv.subtotal,
        inv.gst_rate,
        inv.gst_amount,
        inv.total_amount,
        inv.created_at
      FROM invoices inv
      JOIN customers c ON inv.customer_id = c.id
      ORDER BY inv.created_at DESC
    `);

    const invoices = invoicesResult.rows;

    for (let invoice of invoices) {
      const itemsResult = await pool.query(
        `SELECT ii.item_name
         FROM invoice_items ii
         WHERE ii.invoice_ref = $1`,
        [invoice.id]
      );

      invoice.item_names = itemsResult.rows.map((r) => r.item_name);
    }

    res.json({ success: true, data: invoices });
  } catch (err) {
    console.error("getAllInvoices error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch invoices" });
  }
}

// GET SINGLE INVOICE
async function getInvoiceById(req, res) {
  const { invoiceId } = req.params;

  try {
    const invoiceResult = await pool.query(
      `
      SELECT
        inv.id,
        inv.invoice_id,
        inv.customer_id,
        c.name AS customer_name,
        c.address AS customer_address,
        c.pan_number AS customer_pan,
        c.gst_number AS customer_gst,
        inv.subtotal,
        inv.gst_rate,
        inv.gst_amount,
        inv.total_amount,
        inv.created_at
      FROM invoices inv
      JOIN customers c ON inv.customer_id = c.id
      WHERE inv.invoice_id = $1
      `,
      [invoiceId.toUpperCase()]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = invoiceResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT *
       FROM invoice_items
       WHERE invoice_ref = $1
       ORDER BY id ASC`,
      [invoice.id]
    );

    invoice.items = itemsResult.rows;

    res.json({ success: true, data: invoice });
  } catch (err) {
    console.error("getInvoiceById error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch invoice" });
  }
}

// GET INVOICES BY CUSTOMER
async function getInvoicesByCustomer(req, res) {
  const { customerId } = req.params;

  try {
    const invoicesResult = await pool.query(
      `
      SELECT
        inv.id,
        inv.invoice_id,
        inv.customer_id,
        c.name AS customer_name,
        inv.subtotal,
        inv.gst_rate,
        inv.gst_amount,
        inv.total_amount,
        inv.created_at
      FROM invoices inv
      JOIN customers c ON inv.customer_id = c.id
      WHERE inv.customer_id = $1
      ORDER BY inv.created_at DESC
      `,
      [customerId]
    );

    const invoices = invoicesResult.rows;

    for (let invoice of invoices) {
      const itemsResult = await pool.query(
        `SELECT item_name FROM invoice_items WHERE invoice_ref = $1`,
        [invoice.id]
      );

      invoice.item_names = itemsResult.rows.map((r) => r.item_name);
    }

    res.json({ success: true, data: invoices });
  } catch (err) {
    console.error("getInvoicesByCustomer error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch invoices for customer" });
  }
}

// CREATE INVOICE
async function createInvoice(req, res) {
  const { customer_id, items } = req.body;

  if (!customer_id) {
    return res.status(400).json({ success: false, message: "Customer ID is required" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "At least one item is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const customerResult = await client.query(
      "SELECT * FROM customers WHERE id = $1",
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const customer = customerResult.rows[0];

    let subtotal = 0;
    const lineItems = [];

    for (const { item_id, quantity } of items) {
      if (!item_id || !quantity || quantity < 1) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Invalid item data" });
      }

      const itemResult = await client.query(
        "SELECT * FROM items WHERE id = $1 AND status = 'Active'",
        [item_id]
      );

      if (itemResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ success: false, message: `Item ${item_id} not found` });
      }

      const item = itemResult.rows[0];

      const line_total = parseFloat(item.selling_price) * parseInt(quantity);
      subtotal += line_total;

      lineItems.push({
        item,
        quantity: parseInt(quantity),
        line_total
      });
    }

    const isGSTRegistered = customer.gst_number;
    const gst_rate = isGSTRegistered ? 0 : 18;
    const gst_amount = isGSTRegistered ? 0 : parseFloat((subtotal * 0.18).toFixed(2));
    const total_amount = parseFloat((subtotal + gst_amount).toFixed(2));

    const invoice_id = await generateInvoiceId();

    const invoiceInsert = await client.query(
      `INSERT INTO invoices 
       (invoice_id, customer_id, subtotal, gst_rate, gst_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [invoice_id, customer_id, subtotal, gst_rate, gst_amount, total_amount]
    );

    const invoice_ref = invoiceInsert.rows[0].id;

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO invoice_items
         (invoice_ref, item_id, item_code, item_name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          invoice_ref,
          li.item.id,
          li.item.item_code,
          li.item.name,
          li.item.selling_price,
          li.quantity,
          li.line_total
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        invoice_id,
        customer_id,
        customer_name: customer.name,
        subtotal,
        gst_rate,
        gst_amount,
        total_amount,
        items: lineItems
      }
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createInvoice error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create invoice" });
  } finally {
    client.release();
  }
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByCustomer,
  createInvoice
};