import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ---- Customers ----
export const fetchCustomers = () =>
  api.get("/customers").then((res) => res.data.data);

export const addCustomer = (data) =>
  api.post("/customers", data).then((res) => res.data);

// ---- Items ----
export const fetchItems = () =>
  api.get("/items").then((res) => res.data.data);

export const addItem = (data) =>
  api.post("/items", data).then((res) => res.data);

// ---- Invoices ----
export const fetchAllInvoices = () =>
  api.get("/invoices").then((res) => res.data.data);

export const fetchInvoiceById = (invoiceId) =>
  api.get(`/invoices/${invoiceId}`).then((res) => res.data.data);

export const fetchInvoicesByCustomer = (customerId) =>
  api.get(`/invoices/customer/${customerId}`).then((res) => res.data.data);

export const createInvoice = (data) =>
  api.post("/invoices", data).then((res) => res.data);
