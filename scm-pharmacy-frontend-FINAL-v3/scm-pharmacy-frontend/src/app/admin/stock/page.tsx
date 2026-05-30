"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Edit2, Package, Search, Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Modal } from "@/components/ui/Modal";
import { Stock } from "@/lib/types";
import { formatPrice, formatDate, formatExpiry, expiryStatus } from "@/lib/utils";
import { parseBulkStockFile, downloadSampleCSV, BulkStockRow } from "@/lib/bulkImport";

interface StockFormData {
  name: string;
  description: string;
  count: string;
  price: string;
  expiryDate: string;  // yyyy-MM-dd string from <input type="date">
}

export default function AdminStockPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<StockFormData>({ name: "", description: "", count: "", price: "", expiryDate: "" });

  // Bulk import state ---
  // bulkOpen: is the bulk import modal showing
  // bulkRows: parsed rows from the uploaded file (preview before import)
  // bulkErrors: parsing errors per row (shown so admin can fix and re-upload)
  // bulkImporting: true while we're posting each row to backend
  // bulkProgress: how many we've imported so far (for progress text)
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<BulkStockRow[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Stock[]>("/stock");
      setStocks(data || []);
    } catch (e: any) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", count: "", price: "", expiryDate: "" });
    setModalOpen(true);
  };

  const openEdit = (stock: Stock) => {
    setEditing(stock);
    setForm({
      name: stock.name || "",
      description: stock.description || "",
      count: String(stock.count ?? ""),
      price: String(stock.price ?? ""),
      expiryDate: stock.expiryDate || "",  // backend sends yyyy-MM-dd, matches input[type=date]
    });
    setModalOpen(true);
  };

  // Opens the file picker. The file picker accepts both .csv and .xlsx
  const handleBulkFileClick = () => {
    setBulkRows([]);
    setBulkErrors([]);
    setBulkProgress(0);
    fileInputRef.current?.click();
  };

  // Called when admin selects a file from the file picker.
  // Parses the file client-side (using SheetJS for both CSV and Excel)
  // and shows a preview of rows + any parsing errors.
  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { rows, errors } = await parseBulkStockFile(file);
    setBulkRows(rows);
    setBulkErrors(errors);
    setBulkOpen(true);  // open modal to show preview

    // Reset input value so same file can be re-uploaded if needed
    e.target.value = "";
  };

  // Sends each parsed row to POST /stock/new sequentially.
  // We track progress so the admin sees what's happening.
  const handleConfirmBulkImport = async () => {
    if (bulkRows.length === 0) return;
    setBulkImporting(true);
    setBulkProgress(0);
    let successCount = 0;
    const failures: string[] = [];

    for (let i = 0; i < bulkRows.length; i++) {
      const row = bulkRows[i];
      try {
        const payload: any = {
          name: row.name,
          description: row.description,
          count: row.count,
          price: row.price,
          active: true,
        };
        if (row.expiryDate) {
          payload.expiryDate = row.expiryDate;
        }
        await api.post("/stock/new", payload);
        successCount++;
      } catch (err: any) {
        failures.push(`Row ${row.__rowNum} (${row.name}): ${extractErrorMessage(err)}`);
      }
      setBulkProgress(i + 1);
    }

    setBulkImporting(false);

    if (successCount === bulkRows.length) {
      toast.success(`Imported all ${successCount} medicines successfully`);
      setBulkOpen(false);
      setBulkRows([]);
      fetchStocks();
    } else if (successCount > 0) {
      toast.success(`Imported ${successCount} / ${bulkRows.length}. See errors below.`);
      setBulkErrors([...bulkErrors, ...failures]);
      fetchStocks();
    } else {
      toast.error("Import failed for all rows");
      setBulkErrors([...bulkErrors, ...failures]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        count: parseInt(form.count) || 0,
        price: parseFloat(form.price) || 0,
        active: true,
      };
      // Only include expiryDate in payload if user actually entered one
      // (empty string would fail backend's yyyy-MM-dd parser)
      if (form.expiryDate) {
        payload.expiryDate = form.expiryDate;
      }
      if (editing) {
        await api.patch(`/stock/patch/${editing.id}`, payload);
        toast.success("Medicine updated");
      } else {
        await api.post("/stock/new", payload);
        toast.success("Medicine added");
      }
      setModalOpen(false);
      fetchStocks();
    } catch (e: any) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = stocks.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <PageHeader
        title="Manage Stock"
        description="Add, edit, or remove medicines from your catalog"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBulkFileClick}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>
        }
      />
      
      {/* Hidden file input triggered by Bulk Import button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChosen}
        className="hidden"
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty
          icon={<Package className="w-6 h-6" />}
          title="No medicines in catalog"
          description="Click 'Add Medicine' to populate your stock"
          action={<Button onClick={openCreate}>Add First Medicine</Button>}
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 text-xs text-ink-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">ID</th>
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Description</th>
                <th className="text-right py-3 px-4 font-medium">Stock</th>
                <th className="text-right py-3 px-4 font-medium">Price</th>
                <th className="text-left py-3 px-4 font-medium">Expiry Date</th>
                <th className="text-left py-3 px-4 font-medium">Last Updated</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock) => {
                const exp = expiryStatus(stock.expiryDate);
                return (
                <tr key={stock.id} className="border-b border-ink-100 hover:bg-ink-50">
                  <td className="py-3 px-4 text-sm text-ink-500">#{stock.id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-ink-900">{stock.name}</td>
                  <td className="py-3 px-4 text-sm text-ink-600 max-w-xs truncate">{stock.description}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={stock.count === 0 ? "text-red-600" : stock.count < 10 ? "text-amber-600" : "text-ink-900"}>
                      {stock.count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-right">{formatPrice(stock.price)}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-ink-700">{formatExpiry(stock.expiryDate)}</span>
                      <span className={`badge ${exp.className} self-start`}>{exp.label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-ink-500">{formatDate(stock.updatedAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEdit(stock)}
                      className="text-brand-600 hover:text-brand-800 p-1 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Add new medicine"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Paracetamol 500mg"
            required
          />
          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Strip of 10 tablets - Pain & Fever relief (Cipla)"
              className="input min-h-[80px]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock count"
              name="count"
              type="number"
              min="0"
              value={form.count}
              onChange={(e) => setForm({ ...form, count: e.target.value })}
              placeholder="100"
              required
            />
            <Input
              label="Price (₹)"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="29.99"
              required
            />
          </div>
          {/* Expiry date - optional but recommended.
              Native HTML date input gives users a calendar picker. */}
          <Input
            label="Expiry date"
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Update" : "Add"} Medicine
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal - shows file parse preview, errors, and import progress */}
      <Modal
        open={bulkOpen}
        onClose={() => !bulkImporting && setBulkOpen(false)}
        title="Bulk Import Medicines"
        size="lg"
      >
        <div className="space-y-4">
          {/* Instructions + template download */}
          <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900 mb-1">
                  Required columns: name, description, count, price
                </p>
                <p className="text-xs text-ink-600 mb-3">
                  Optional column: expiryDate (yyyy-MM-dd format). Accepts .csv, .xlsx, or .xls files.
                </p>
                <Button
                  variant="secondary"
                  onClick={downloadSampleCSV}
                  className="text-xs px-3 py-1.5"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download Sample CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Parse errors (if any) */}
          {bulkErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-900">
                  {bulkErrors.length} error{bulkErrors.length === 1 ? "" : "s"} found
                </p>
              </div>
              <ul className="text-xs text-red-700 space-y-1 ml-6 list-disc max-h-40 overflow-y-auto">
                {bulkErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview table — show admin what will be imported */}
          {bulkRows.length > 0 && (
            <div>
              <p className="text-sm font-medium text-ink-900 mb-2">
                {bulkRows.length} medicine{bulkRows.length === 1 ? "" : "s"} ready to import
              </p>
              <div className="border border-ink-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-ink-50 text-ink-500 uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Row</th>
                      <th className="text-left px-3 py-2 font-medium">Name</th>
                      <th className="text-right px-3 py-2 font-medium">Count</th>
                      <th className="text-right px-3 py-2 font-medium">Price</th>
                      <th className="text-left px-3 py-2 font-medium">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map((row, idx) => (
                      <tr key={idx} className="border-t border-ink-100">
                        <td className="px-3 py-2 text-ink-500">{row.__rowNum}</td>
                        <td className="px-3 py-2 font-medium">{row.name}</td>
                        <td className="px-3 py-2 text-right">{row.count}</td>
                        <td className="px-3 py-2 text-right">{formatPrice(row.price)}</td>
                        <td className="px-3 py-2 text-ink-500">{row.expiryDate || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress display while importing */}
          {bulkImporting && (
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-3">
              <p className="text-sm text-brand-900">
                Importing... {bulkProgress} / {bulkRows.length}
              </p>
              <div className="mt-2 w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-2 transition-all"
                  style={{
                    width: `${Math.round((bulkProgress / bulkRows.length) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* No rows yet - show upload prompt */}
          {bulkRows.length === 0 && bulkErrors.length === 0 && (
            <div className="text-center py-6 text-sm text-ink-500">
              No file selected. Close this and click "Bulk Import" again to choose a file.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBulkOpen(false)}
              disabled={bulkImporting}
            >
              {bulkImporting ? "Importing..." : "Cancel"}
            </Button>
            {bulkRows.length > 0 && (
              <Button
                onClick={handleConfirmBulkImport}
                loading={bulkImporting}
                disabled={bulkImporting}
              >
                Import {bulkRows.length} Medicine{bulkRows.length === 1 ? "" : "s"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </ProtectedLayout>
  );
}
