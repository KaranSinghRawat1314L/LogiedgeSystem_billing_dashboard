-- LogiEdge Billing Dashboard - Database Schema

-- Create database
CREATE DATABASE logedge_db;
\c logedge_db;

-- MASTER TABLES

CREATE TABLE customers (
    id           SERIAL PRIMARY KEY,
    cust_id      VARCHAR(10) UNIQUE NOT NULL,
    name         VARCHAR(200) NOT NULL,
    address      VARCHAR(300) NOT NULL,
    pan_number   VARCHAR(10) NOT NULL CHECK (LENGTH(pan_number) = 10),
    gst_number   VARCHAR(15) CHECK (LENGTH(gst_number) = 15),
    status       VARCHAR(20) NOT NULL
                 CHECK (status IN ('Active', 'In-Active')),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id            SERIAL PRIMARY KEY,
    item_code     VARCHAR(10) UNIQUE NOT NULL,
    name          VARCHAR(200) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    status        VARCHAR(20) NOT NULL
                  CHECK (status IN ('Active', 'In-Active')),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TRANSACTION TABLES

CREATE TABLE invoices (
    id            SERIAL PRIMARY KEY,
    invoice_id    VARCHAR(10) UNIQUE NOT NULL,
    customer_id   INTEGER NOT NULL REFERENCES customers(id),
    subtotal      NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    gst_rate      NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (gst_rate >= 0),
    gst_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
    total_amount  NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    id            SERIAL PRIMARY KEY,
    invoice_ref   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_id       INTEGER NOT NULL REFERENCES items(id),
    item_code     VARCHAR(10) NOT NULL,
    item_name     VARCHAR(200) NOT NULL,
    unit_price    NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    line_total    NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_created_at  ON invoices(created_at DESC);
CREATE INDEX idx_invoice_items_invoice_ref ON invoice_items(invoice_ref);
CREATE INDEX idx_invoice_items_item_id ON invoice_items(item_id);

-- SEED DATA

-- Customers
INSERT INTO customers (cust_id, name, address, pan_number, gst_number, status) VALUES
('C00001', 'Gupta Enterprize Pvt. Ltd.', 'Gurgaon, Haryana', 'BCNSG1234H', '06BCNSG1234H1Z5', 'Active'),
('C00002', 'Mahesh Industries Pvt. Ltd.', 'Delhi, Delhi', 'AMNSM1234U', '07AMNSM1234U1Z5', 'Active'),
('C00003', 'Omkar and Brothers Pvt. Ltd.', 'Uttrakhand, Uttar Pradesh', 'CNBSO1234S', '05CNBSO1234S1Z5', 'In-Active'),
('C00004', 'Bhuwan Infotech.', 'Alwar, Rajasthan', 'CMNSB1234A', '08CMNSB1234A1Z5', 'Active'),
('C00005', 'Swastik Software Pvt. Ltd.', 'Gurgaon, Haryana', 'AGBCS1234B', '06AGBCS1234B1Z5', 'Active');

-- Items
INSERT INTO items (item_code, name, selling_price, status) VALUES
('IT00001', 'Laptop', 85000, 'Active'),
('IT00002', 'LED Monitor', 13450, 'Active'),
('IT00003', 'Pen Drive', 980, 'Active'),
('IT00004', 'Mobile', 18900, 'Active'),
('IT00005', 'Headphone', 2350, 'In-Active'),
('IT00006', 'Bagpack', 1200, 'Active'),
('IT00007', 'Powerbank', 1400, 'Active');