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

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, React Router v6, Axios        |
| Backend  | Node.js, Express.js                     |
| Database | PostgreSQL — Neon (prod) / local (dev)  |
| Styling  | Custom CSS (no UI library)              |
| Hosting  | Vercel (frontend) + Render (backend)    |

---

## Database

This project uses **two database setups** depending on the environment:

| Environment | Database          | How it connects              |
|-------------|-------------------|------------------------------|
| Local dev   | Local PostgreSQL   | Host/port/user/password vars |
| Production  | Neon (cloud)      | `DATABASE_URL` connection string with SSL |

`pool.js` automatically detects which to use:
- If `DATABASE_URL` is set → connects to Neon with SSL
- Otherwise → connects to local PostgreSQL using individual env vars

---

## Local Development Setup

### Step 1 — Database (local PostgreSQL)

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
# Edit .env with your local DB credentials (no DATABASE_URL needed locally)
```

Your local `.env`:
```
PORT=5000
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

> In development, keep `"proxy": "http://localhost:5000"` in `frontend/package.json`
> and do **not** set `REACT_APP_API_URL` locally — the proxy handles it.

---

## Production Deployment

### Backend on Render

Set these environment variables in Render → your backend service → Environment:

```
DATABASE_URL  = postgresql://user:password@host.neon.tech/dbname?sslmode=require
FRONTEND_URL  = https://your-app.vercel.app
NODE_ENV      = production
PORT          = 5000
```

> Get `DATABASE_URL` from your Neon dashboard → Connection Details → Connection string.

To seed production data, run `database.sql` against your Neon DB:
```bash
psql "your-neon-connection-string" -f database.sql
```

### Frontend on Vercel

Set this environment variable in Vercel → your project → Settings → Environment Variables:

```
REACT_APP_API_URL = https://your-backend-name.onrender.com/api
```

Then go to **Deployments → Redeploy** so Vercel bakes the new env var into the build.

> Remove `"proxy"` from `frontend/package.json` before deploying to Vercel.

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
- **GST Logic**: customer with GST number → 0% GST. Customer without → 18% GST on subtotal
- Invoice ID auto-generated: `INVC` + 6 random digits (e.g. `INVC224830`), guaranteed unique
- After creating, invoice is displayed with the Invoice ID

---

## API Endpoints

### Customers
| Method | Endpoint       | Description       |
|--------|----------------|-------------------|
| GET    | /api/customers | Get all customers |
| POST   | /api/customers | Create a customer |

### Items
| Method | Endpoint   | Description    |
|--------|------------|----------------|
| GET    | /api/items | Get all items  |
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
Example: `INVC224830`, `INVC591034`, `INVC774423`

Uniqueness is guaranteed by checking the database before inserting.

---

## Notes

- **Render free tier**: the backend spins down after ~15 min of inactivity.
  The first request after a cold start may take 30–60 seconds to respond.
  This is normal on the free plan.
- **Neon free tier**: 0.5 GB storage, auto-suspends after 5 min of inactivity
  but wakes up automatically on the next query (usually < 1 second).
