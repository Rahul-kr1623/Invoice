import { useState, useEffect, useCallback } from "react";
import { getInvoices, deleteInvoice } from "../api/invoices";
import toast from "react-hot-toast";

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, page_size: 10, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInvoices(page, 10, search);
      setInvoices(res.data.items);
      setPagination({
        total: res.data.total,
        page: res.data.page,
        page_size: res.data.page_size,
        total_pages: res.data.total_pages,
      });
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      toast.success("Invoice deleted");
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  return { invoices, pagination, loading, search, setSearch, page, setPage, handleDelete, refresh: fetchInvoices };
}
