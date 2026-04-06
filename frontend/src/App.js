import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";

import DashboardPage  from "./pages/DashboardPage";
import MasterPage     from "./pages/MasterPage";
import CustomerList   from "./pages/CustomerList";
import AddCustomer    from "./pages/AddCustomer";
import ItemList       from "./pages/ItemList";
import AddItem        from "./pages/AddItem";
import BillingPage    from "./pages/BillingPage";
import InvoiceView    from "./pages/InvoiceView";

const DashboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const MasterIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const BillingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="8" y1="8"  x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="12" y2="16" />
  </svg>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <div className="top-header" />

        <div className="body-wrapper">
          <aside className="sidebar">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "sidebar-nav-item" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon"><DashboardIcon /></span>
              Dashboard
            </NavLink>

            <NavLink
              to="/master"
              className={({ isActive }) =>
                "sidebar-nav-item" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon"><MasterIcon /></span>
              Master
            </NavLink>

            <NavLink
              to="/billing"
              className={({ isActive }) =>
                "sidebar-nav-item" + (isActive ? " active" : "")
              }
            >
              <span className="nav-icon"><BillingIcon /></span>
              Billing
            </NavLink>
          </aside>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/invoice/:invoiceId" element={<InvoiceView />} />
              <Route path="/master" element={<MasterPage />} />
              <Route path="/master/customers" element={<CustomerList />} />
              <Route path="/master/customers/add" element={<AddCustomer />} />
              <Route path="/master/items" element={<ItemList />} />
              <Route path="/master/items/add" element={<AddItem />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
