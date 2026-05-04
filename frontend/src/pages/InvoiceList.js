import React, { useState } from "react";
import { useInvoices } from "../hooks/useInvoices";

export default function InvoiceList({ onEdit, onNew }) {
  const { invoices, pagination, loading, search, setSearch, page, setPage, handleDelete } = useInvoices();
  const [searchInput, setSearchInput] = useState(search);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  const formatAmount = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="list-header">
        <h1 className="list-title">Invoices <span>({pagination.total})</span></h1>
        <form className="search-bar" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <button className="btn btn-primary" onClick={onNew}>+ New Invoice</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Loading invoices...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No invoices found. Create your first one!</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Invoice No.</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={inv.id}>
                      <td style={{ color: "var(--text-dim)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {(page - 1) * 10 + i + 1}
                      </td>
                      <td><span className="inv-number">{inv.invoice_number}</span></td>
                      <td><span className="customer-name">{inv.customer_name}</span></td>
                      <td><span className="date-cell">{formatDate(inv.date)}</span></td>
                      <td><span className="badge">{inv.details.length} item{inv.details.length !== 1 ? "s" : ""}</span></td>
                      <td><span className="amount">{formatAmount(inv.total_amount)}</span></td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(inv)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.total_pages > 1 && (
              <div className="pagination">
                <span>Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}</span>
                <div className="pagination-pages">
                  <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pagination.total_pages}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
