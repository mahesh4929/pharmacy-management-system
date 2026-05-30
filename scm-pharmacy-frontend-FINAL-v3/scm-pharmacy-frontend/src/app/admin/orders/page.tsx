"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Package, Search } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Order } from "@/lib/types";
import { formatPrice, formatDate, statusColor } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Order[]>("/orders");
        setOrders((data || []).sort((a, b) => (b.id || 0) - (a.id || 0)));
      } catch (e: any) {
        toast.error(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = orders.filter(
    (o) =>
      String(o.id).includes(search) ||
      String(o.customer_id).includes(search) ||
      o.invoice?.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <PageHeader title="All Orders" description="View every order placed in the system" />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="Search by order ID, customer ID, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty
          icon={<ClipboardList className="w-6 h-6" />}
          title="No orders found"
          description="When customers place orders, they will appear here"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="card">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-ink-100 flex-wrap gap-2">
                <div>
                  <p className="text-xs text-ink-500">Order ID</p>
                  <p className="font-semibold text-sm text-ink-900">#{order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Customer ID</p>
                  <p className="font-semibold text-sm text-ink-900">#{order.customer_id}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Date</p>
                  <p className="font-semibold text-sm text-ink-900">{formatDate(order.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Items</p>
                  <p className="font-semibold text-sm text-ink-900">{order.ordered_items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Total</p>
                  <p className="font-semibold text-sm text-ink-900">
                    {formatPrice(order.invoice?.totalPrice)}
                  </p>
                </div>
                <div>
                  <span className={`badge ${statusColor(order.invoice?.status || "unfulfilled")}`}>
                    {order.invoice?.status || "unfulfilled"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">Items</p>
                {order.ordered_items?.map((oi, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-ink-400" />
                      <span>{oi.stock_name || oi.stock?.name || `Medicine #${oi.stock_id}`}</span>
                    </div>
                    <span className="text-ink-500">× {oi.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}
