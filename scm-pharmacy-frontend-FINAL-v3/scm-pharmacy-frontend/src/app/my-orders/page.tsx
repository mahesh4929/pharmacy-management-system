"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Package, X, Download } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Modal } from "@/components/ui/Modal";
import { Order } from "@/lib/types";
import { formatPrice, formatDate, statusColor } from "@/lib/utils";
import { downloadInvoicePdf } from "@/lib/pdf";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // Tracks which order is in the middle of cancelling (so only THAT button shows spinner)
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  // Confirmation modal state — we don't blindly cancel on click, we confirm first
  const [confirmOrderId, setConfirmOrderId] = useState<number | null>(null);

  // Load this customer's orders (sorted newest first)
  const fetchOrders = async () => {
    const session = getSession();
    if (!session) return;
    setLoading(true);
    try {
      const { data } = await api.get<Order[]>(`/orders/customer/${session.userId}`);
      setOrders((data || []).sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (e: any) {
      toast.error(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calls PATCH /orders/delete/{id} which is a soft-delete (marks status as cancelled
  // and returns stock count). Backend rejects if order is already fulfilled/cancelled.
  const handleCancel = async (orderId: number) => {
    setCancellingId(orderId);
    setConfirmOrderId(null);  // close the confirmation modal
    try {
      await api.patch(`/orders/delete/${orderId}`);
      toast.success("Order cancelled. Stock has been restored.");
      // Refresh list so the cancelled status badge shows up
      await fetchOrders();
    } catch (e: any) {
      toast.error(extractErrorMessage(e));
    } finally {
      setCancellingId(null);
    }
  };

  // Backend rules: can only cancel if status is unfulfilled or in progress.
  // Fulfilled or cancelled orders cannot be cancelled (backend returns 400).
  // We hide the button when cancellation isn't allowed — matches business logic.
  const isCancellable = (status: string | undefined) => {
    const s = (status || "unfulfilled").toLowerCase();
    return s === "unfulfilled" || s === "in progress";
  };

  return (
    <ProtectedLayout allowedRoles={["customer"]}>
      <PageHeader title="My Orders" description="View your order history and track status" />

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <Empty
          icon={<ClipboardList className="w-6 h-6" />}
          title="No orders yet"
          description="When you place an order, it will appear here"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = order.invoice?.status || "unfulfilled";
            return (
              <div key={order.id} className="card">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-ink-100 flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-ink-500">Order ID</p>
                    <p className="font-semibold text-sm text-ink-900">#{order.id}</p>
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
                    <p className="text-xs text-ink-500">Payment</p>
                    <p className="font-semibold text-sm text-ink-900">
                      {order.paymentMethod === "ONLINE" ? "Online" : "Cash on Delivery"}
                    </p>
                  </div>
                  <div>
                    <span className={`badge ${statusColor(status)}`}>{status}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
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

                {/* Action row — Cancel (if eligible) + Download Invoice */}
                <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
                  <Button
                    variant="secondary"
                    onClick={() => downloadInvoicePdf(order)}
                    className="px-3 py-1.5 text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download Invoice
                  </Button>
                  {isCancellable(status) && (
                    <Button
                      variant="danger"
                      onClick={() => setConfirmOrderId(order.id)}
                      loading={cancellingId === order.id}
                      className="px-3 py-1.5 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal to prevent accidental cancellation */}
      <Modal
        open={confirmOrderId !== null}
        onClose={() => setConfirmOrderId(null)}
        title="Cancel this order?"
        size="sm"
      >
        <p className="text-sm text-ink-600 mb-4">
          This will cancel order <strong>#{confirmOrderId}</strong> and restore the stock count.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmOrderId(null)}>
            Keep Order
          </Button>
          <Button
            variant="danger"
            onClick={() => confirmOrderId && handleCancel(confirmOrderId)}
          >
            Yes, Cancel Order
          </Button>
        </div>
      </Modal>
    </ProtectedLayout>
  );
}
