# LogiEdge Billing Dashboard

A full-stack billing web application built with **React JS**, **Node.js + Express JS**, and **PostgreSQL**.

---

## Project Structure

```
logedge/
├── database.sql              ← Run this to set up local DB schema + seed data
├── README.md
│
├── backend/                  ← Back-End Server
│   ├── server.js             ← Express entry point
│   ├── package.json
│   ├── .env.example          ← Copy to .env and fill in your credentials
│   ├── db/
│   │   └── pool.js           ← PostgreSQL connection pool (local + Neon)
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

| Layer    | Technology                             |
|----------|----------------------------------------|
| Frontend | React 18, React Router v6, Axios       |
| Backend  | Node.js, Express.js                    |
| Database | PostgreSQL — Neon (prod) / local (dev) |
| Styling  | Custom CSS (no UI library)             |
| Hosting  | Vercel (frontend) + Render (backend)   |

---

## Database

This project uses two database setups depending on the environment:

| Environment | Database       | Connection                            |
|-------------|----------------|---------------------------------------|
| Local dev   | Local PostgreSQL | Individual host/port/user/password vars |
| Production  | Neon (cloud)   | `DATABASE_URL` connection string with SSL |

`pool.js` automatically detects which to use — if `DATABASE_URL` is set it connects to Neon, otherwise it falls back to local PostgreSQL.

---

## Local Development Setup

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
cp .env.example .env
```

Fill in your local `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logedge_db
DB_USER=postgres
DB_PASSWORD=your_local_password
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev    # starts on http://localhost:5000
```

### Step 3 — Frontend

```bash
cd frontend
npm install
npm start      # starts on http://localhost:3000
```

---

## Production Deployment

### Backend — Render

Set these environment variables in Render → your backend service → Environment:

```
DATABASE_URL = postgresql://user:password@host.neon.tech/dbname?sslmode=require
FRONTEND_URL = https://your-app.vercel.app
```

> Get `DATABASE_URL` from your Neon dashboard → Connection Details → Connection string.

To seed your Neon database with initial data, run:

```bash
psql "your-neon-connection-string" -f database.sql
```

### Frontend — Vercel

Set this environment variable in Vercel → your project → Settings → Environment Variables:

```
REACT_APP_API_URL = https://your-backend-name.onrender.com/api
```

After adding the variable go to **Deployments → Redeploy** so Vercel bakes it into the build.

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
- Select a customer (only Active customers are selectable)
- Select items with quantity stepper (+ n −)
- **GST Logic** — customer with GST number → 0% GST applied. Customer without GST number → 18% GST added on subtotal
- Invoice ID auto-generated as `INVC` + 6 random digits (e.g. `INVC224830`), guaranteed unique
- After creating, the invoice is displayed with the Invoice ID

---

## API Endpoints

### Customers
| Method | Endpoint       | Description       |
|--------|----------------|-------------------|
| GET    | /api/customers | Get all customers |
| POST   | /api/customers | Create a customer |

### Items
| Method | Endpoint   | Description   |
|--------|------------|---------------|
| GET    | /api/items | Get all items |
| POST   | /api/items | Create an item |

### Invoices
| Method | Endpoint                       | Description                     |
|--------|--------------------------------|---------------------------------|
| GET    | /api/invoices                  | Get all invoices (recent first) |
| GET    | /api/invoices/:invoiceId       | Get one invoice by ID           |
| GET    | /api/invoices/customer/:custId | Get invoices for one customer   |
| POST   | /api/invoices                  | Create a new invoice            |

---

## GST Logic

```
Customer has GST Number  →  GST Rate = 0%   (GST registered, no tax added)
Customer has no GST Num  →  GST Rate = 18%  (applied on subtotal)
```

---

## Invoice ID Format

Auto-generated as `INVC` + 6 random digits = 10 characters total.
Examples: `INVC224830`, `INVC591034`, `INVC774423`

Uniqueness is guaranteed by checking the database before inserting.

---

## Notes

- **Render free tier** — the backend spins down after ~15 minutes of inactivity. The first request after a cold start may take 30–60 seconds. This is expected behaviour on the free plan.
- **Neon free tier** — 0.5 GB storage limit. The database auto-suspends after inactivity but wakes up automatically on the next query.
