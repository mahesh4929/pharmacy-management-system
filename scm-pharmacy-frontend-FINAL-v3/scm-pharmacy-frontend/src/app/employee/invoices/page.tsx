"use client";

import { useEffect, useState } from "react";
import { Receipt, CheckCircle, Search, Download } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Invoice } from "@/lib/types";
import { formatPrice, formatDate, statusColor } from "@/lib/utils";
import { downloadInvoicePdfFromInvoice } from "@/lib/pdf";

export default function EmployeeInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchInvoices = async () => {
    const session = getSession();
    if (!session) return;
    setLoading(true);
    try {
      // Admin sees ALL invoices; regular employees see only invoices assigned to them
      const url = session.role === "admin"
        ? "/invoices"
        : `/invoices/employee/${session.userId}`;
      const { data } = await api.get<Invoice[]>(url);
      setInvoices(data || []);
    } catch (e: any) {
      // employee may not have invoices yet - that's fine
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFulfill = async (invoice: Invoice) => {
    setUpdatingId(invoice.id);
    try {
      await api.patch(`/invoices/patch/${invoice.id}`, {});
      toast.success("Invoice updated");
      fetchInvoices();
    } catch (e: any) {
      toast.error(extractErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = invoices.filter((i) =>
    String(i.id).includes(search) || i.status?.includes(search.toLowerCase())
  );

  return (
    <ProtectedLayout allowedRoles={["admin", "employee"]}>
      <PageHeader
        title="Invoices"
        description="View and process customer invoices"
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="Search by invoice ID or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty
          icon={<Receipt className="w-6 h-6" />}
          title="No invoices assigned"
          description="When you process an invoice, it will appear here"
        />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 text-xs text-ink-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">Invoice ID</th>
                <th className="text-left py-3 px-4 font-medium">Order ID</th>
                <th className="text-right py-3 px-4 font-medium">Total</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-ink-100 hover:bg-ink-50">
                  <td className="py-3 px-4 text-sm font-medium text-ink-900">#{inv.id}</td>
                  <td className="py-3 px-4 text-sm text-ink-600">
                    {inv.order?.id ? `#${inv.order.id}` : "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    {formatPrice(inv.totalPrice)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${statusColor(inv.status)}`}>{inv.status}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-ink-500">{formatDate(inv.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => downloadInvoicePdfFromInvoice(inv)}
                        className="px-3 py-1.5 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      {inv.status?.toLowerCase() !== "fulfilled" && (
                        <Button
                          onClick={() => handleFulfill(inv)}
                          loading={updatingId === inv.id}
                          className="px-3 py-1.5 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Update Status
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ProtectedLayout>
  );
}
