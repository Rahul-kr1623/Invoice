import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "";

const api = axios.create({
  baseURL: `${BASE_URL}/api/invoices`,
  headers: { "Content-Type": "application/json" },
});

export const getInvoices = (page = 1, pageSize = 10, search = "") =>
  api.get("/", { params: { page, page_size: pageSize, search: search || undefined } });

export const getInvoice = (id) => api.get(`/${id}`);
export const createInvoice = (data) => api.post("/", data);
export const updateInvoice = (id, data) => api.put(`/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/${id}`);
