import React, { useState } from "react";
import toast from "react-hot-toast";
import { createInvoice, updateInvoice } from "../api/invoices";

const emptyDetail = () => ({ description: "", quantity: "", unit_price: "" });

// Safe date formatter — avoids timezone shift issues
const formatDate = (dateVal) => {
  if (!dateVal) return new Date().toISOString().split("T")[0];
  // If it's already a YYYY-MM-DD string, use it directly
  if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  // Otherwise parse and extract date part safely
  const str = String(dateVal);
  return str.substring(0, 10);
};

export default function InvoiceForm({ invoice, onSuccess, onCancel }) {
  const isEdit = !!invoice;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    invoice_number: invoice?.invoice_number || "",
    customer_name: invoice?.customer_name || "",
    date: formatDate(invoice?.date),
  });

  const [details, setDetails] = useState(
    invoice?.details?.map(d => ({
      description: d.description,
      quantity: String(d.quantity),
      unit_price: String(d.unit_price),
    })) || [emptyDetail()]
  );

  const setField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const setDetail = (index, field, value) => {
    setDetails(d => d.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setErrors(e => ({ ...e, [`detail_${index}_${field}`]: undefined }));
  };

  const addDetail = () => setDetails(d => [...d, emptyDetail()]);
  const removeDetail = (index) => setDetails(d => d.filter((_, i) => i !== index));

  const calcLineTotal = (d) => {
    const q = parseFloat(d.quantity), u = parseFloat(d.unit_price);
    return (!isNaN(q) && !isNaN(u) && q > 0 && u > 0) ? (q * u).toFixed(2) : null;
  };

  const totalAmount = details.reduce((sum, d) => {
    const lt = calcLineTotal(d);
    return sum + (lt ? parseFloat(lt) : 0);
  }, 0);

  const validate = () => {
    const errs = {};
    if (!form.invoice_number.trim()) errs.invoice_number = "Required";
    if (!form.customer_name.trim()) errs.customer_name = "Required";
    if (!form.date) errs.date = "Required";
    details.forEach((d, i) => {
      if (!d.description.trim()) errs[`detail_${i}_description`] = "Required";
      if (!d.quantity || isNaN(d.quantity) || Number(d.quantity) <= 0) errs[`detail_${i}_quantity`] = "Must be > 0";
      if (!d.unit_price || isNaN(d.unit_price) || Number(d.unit_price) <= 0) errs[`detail_${i}_unit_price`] = "Must be > 0";
    });
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        date: form.date, // always YYYY-MM-DD string
        details: details.map(d => ({
          description: d.description,
          quantity: parseInt(d.quantity),
          unit_price: parseFloat(d.unit_price),
        }))
      };

      // Only include invoice_number for new invoices
      if (!isEdit) {
        payload.invoice_number = form.invoice_number;
      }

      if (isEdit) {
        await updateInvoice(invoice.id, payload);
        toast.success("Invoice updated!");
      } else {
        await createInvoice(payload);
        toast.success("Invoice created!");
      }
      onSuccess();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        const errMap = {};
        detail.forEach(e => {
          const field = e.loc?.slice(-1)[0];
          if (field) errMap[field] = e.msg;
        });
        setErrors(errMap);
        toast.error("Please fix the errors below");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="form-header">
        <h1 className="form-title">{isEdit ? "Edit Invoice" : "New Invoice"}</h1>
        <p className="form-subtitle">{isEdit ? `Editing ${invoice.invoice_number}` : "Fill in the details below"}</p>
      </div>

      <div className="card" style={{ padding: "28px" }}>
        {/* Invoice Info */}
        <div className="form-section">
          <span className="section-label">Invoice Details</span>
          <div className="form-grid">
            <div className="field">
              <label>Invoice Number *</label>
              <input
                type="text"
                value={form.invoice_number}
                onChange={e => setField("invoice_number", e.target.value)}
                disabled={isEdit}
                placeholder="INV001"
                className={errors.invoice_number ? "error" : ""}
              />
              {errors.invoice_number && <span className="field-error">{errors.invoice_number}</span>}
            </div>
            <div className="field">
              <label>Customer Name *</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={e => setField("customer_name", e.target.value)}
                placeholder="John Doe"
                className={errors.customer_name ? "error" : ""}
              />
              {errors.customer_name && <span className="field-error">{errors.customer_name}</span>}
            </div>
            <div className="field">
              <label>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setField("date", e.target.value)}
                className={errors.date ? "error" : ""}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="form-section">
          <div className="line-items-header">
            <span className="section-label" style={{ margin: 0 }}>Line Items</span>
            <button className="btn btn-ghost btn-sm" onClick={addDetail}>+ Add Item</button>
          </div>

          {details.map((d, i) => (
            <div className="line-item-row" key={i}>
              <div className="field">
                {i === 0 && <label>Description</label>}
                <input
                  type="text" value={d.description} placeholder="Item description"
                  onChange={e => setDetail(i, "description", e.target.value)}
                  className={errors[`detail_${i}_description`] ? "error" : ""}
                />
                {errors[`detail_${i}_description`] && <span className="field-error">{errors[`detail_${i}_description`]}</span>}
              </div>
              <div className="field">
                {i === 0 && <label>Qty</label>}
                <input
                  type="number" value={d.quantity} placeholder="1" min="1"
                  onChange={e => setDetail(i, "quantity", e.target.value)}
                  className={errors[`detail_${i}_quantity`] ? "error" : ""}
                />
                {errors[`detail_${i}_quantity`] && <span className="field-error">{errors[`detail_${i}_quantity`]}</span>}
              </div>
              <div className="field">
                {i === 0 && <label>Unit Price</label>}
                <input
                  type="number" value={d.unit_price} placeholder="0.00" min="0" step="0.01"
                  onChange={e => setDetail(i, "unit_price", e.target.value)}
                  className={errors[`detail_${i}_unit_price`] ? "error" : ""}
                />
                {errors[`detail_${i}_unit_price`] && <span className="field-error">{errors[`detail_${i}_unit_price`]}</span>}
              </div>
              <div>
                {i === 0 && <label className="field" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, display: "block" }}>Subtotal</label>}
                <div className="line-total-display">
                  {calcLineTotal(d) ? `₹${parseFloat(calcLineTotal(d)).toLocaleString()}` : "—"}
                </div>
              </div>
              <div className="remove-btn-wrap" style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  className="remove-btn"
                  onClick={() => details.length > 1 && removeDetail(i)}
                  disabled={details.length === 1}
                  title="Remove item"
                >×</button>
              </div>
            </div>
          ))}

          <div className="invoice-total">
            <div className="total-label">Total Amount</div>
            <div className="total-amount">
              <span className="total-currency">₹</span>
              {totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Invoice" : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}