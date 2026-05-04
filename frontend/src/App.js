import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import InvoiceList from "./pages/InvoiceList";
import InvoiceForm from "./pages/InvoiceForm";
import "./App.css";

export default function App() {
  const [view, setView] = useState("list"); // "list" | "create" | "edit"
  const [editingInvoice, setEditingInvoice] = useState(null);

  const goToCreate = () => { setEditingInvoice(null); setView("create"); };
  const goToEdit = (inv) => { setEditingInvoice(inv); setView("edit"); };
  const goToList = () => { setEditingInvoice(null); setView("list"); };

  return (
    <div className="app">
      <Toaster position="top-right" />
      <header className="app-header">
        <div className="header-inner">
          <div className="logo" onClick={goToList}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">InvoiceOS</span>
          </div>
          {view === "list" && (
            <button className="btn btn-primary" onClick={goToCreate}>
              + New Invoice
            </button>
          )}
          {(view === "create" || view === "edit") && (
            <button className="btn btn-ghost" onClick={goToList}>
              ← Back to List
            </button>
          )}
        </div>
      </header>
      <main className="app-main">
        {view === "list" && (
          <InvoiceList onEdit={goToEdit} onNew={goToCreate} />
        )}
        {(view === "create" || view === "edit") && (
          <InvoiceForm
            invoice={editingInvoice}
            onSuccess={goToList}
            onCancel={goToList}
          />
        )}
      </main>
    </div>
  );
}
