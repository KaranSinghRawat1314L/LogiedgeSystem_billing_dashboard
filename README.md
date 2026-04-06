# LogiEdge Billing Dashboard

A full-stack billing web application built with **React JS**, **Node.js + Express JS**, and **PostgreSQL**.

---

## Project Structure

```
logedge/
├── database.sql              ← Run this first to set up the DB
├── README.md
│
├── backend/                  ← Back-End Server
│   ├── server.js             ← Express entry point
│   ├── package.json
│   ├── .env.example          ← Copy to .env and fill in your DB credentials
│   ├── db/
│   │   └── pool.js           ← PostgreSQL connection pool
│   ├── controllers/
│   │   ├── customerController.js
│   │   ├── itemController.js
│   │   └── invoiceController.js
│   └── routes/
│       ├── customers.js
│       ├── items.js
│       └── invoices.js
│
└── frontend/                 ← Front-End App
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css         ← All styles (no UI library used)
        ├── App.js            ← Router + Layout
        ├── services/
        │   └── api.js        ← All API calls (axios)
        └── pages/
            ├── DashboardPage.js
            ├── InvoiceView.js
            ├── MasterPage.js
            ├── CustomerList.js
            ├── AddCustomer.js
            ├── ItemList.js
            ├── AddItem.js
            └── BillingPage.js
```

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, React Router v6, Axios |
| Backend  | Node.js, Express.js     |
| Database | PostgreSQL               |
| Styling  | Custom CSS (no UI library) |

---

## Setup Instructions

### Step 1 — Database

Make sure PostgreSQL is installed and running, then:

```bash
psql -U postgres -f database.sql
```

This creates the `logedge_db` database, all tables, and seeds sample data.

### Step 2 — Backend

```bash
cd backend
npm install

# Copy the example env file and fill in your DB password
cp .env.example .env
# Edit .env: set DB_PASSWORD=your_actual_password

# Start the server
npm run dev       # development (uses nodemon for auto-restart)
# or
npm start         # production
```

The API server starts on **http://localhost:5000**

### Step 3 — Frontend

```bash
cd frontend
npm install
npm start
```

The app opens on **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in `frontend/package.json` automatically
routes all `/api/*` requests to the backend — no CORS issues in development.

---

## Features

### Dashboard
- View all invoices in a table (Invoice ID, Customer Name, Items, Amount)
- Search invoices by Invoice ID (real-time filter)
- Filter invoices by specific customer
- Click **View** to see full invoice details

### Master Module
- **Customers** — view all customers as cards (Active / In-Active), add new customers
- **Items** — view all items as cards (Active / In-Active), add new items

### Billing Module
- Select a customer (only Active customers are clickable)
- Select items with quantity stepper (+ n −)
- **GST Logic**: If customer has a GST number → no GST added. If no GST number → 18% GST added on subtotal
- Invoice ID is auto-generated: `INVC` + 6 random digits (e.g. `INVC224830`), guaranteed unique
- After creating, the invoice is displayed with the Invoice ID

---

## API Endpoints

### Customers
| Method | Endpoint         | Description        |
|--------|------------------|--------------------|
| GET    | /api/customers   | Get all customers  |
| POST   | /api/customers   | Create a customer  |

### Items
| Method | Endpoint     | Description    |
|--------|--------------|----------------|
| GET    | /api/items   | Get all items  |
| POST   | /api/items   | Create an item |

### Invoices
| Method | Endpoint                          | Description                       |
|--------|-----------------------------------|-----------------------------------|
| GET    | /api/invoices                     | Get all invoices (recent first)   |
| GET    | /api/invoices/:invoiceId          | Get one invoice by ID             |
| GET    | /api/invoices/customer/:custId    | Get invoices for one customer     |
| POST   | /api/invoices                     | Create a new invoice              |

---

## GST Logic

```
Customer has GST Number  →  GST Rate = 0%   (B2B, reverse charge)
Customer has no GST Num  →  GST Rate = 18%  (applied on subtotal)
```

---

## Invoice ID Format

Auto-generated as `INVC` + 6 random digits = 10 characters total  
Example: `INVC224830`, `INVC591034`, `INVC774423`

Uniqueness is guaranteed by checking the database before inserting.
