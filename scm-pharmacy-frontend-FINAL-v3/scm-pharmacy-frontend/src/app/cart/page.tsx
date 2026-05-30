"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, ArrowRight, Banknote, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { CartItem, getCart, removeFromCart, updateCartItem, clearCart, cartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

// Two payment methods supported. Backend stores the chosen value verbatim.
// "ONLINE" is recorded but no real gateway integration - this is record-keeping only.
type PaymentMethod = "COD" | "ONLINE";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Default to COD because it's the most common in Indian pharmacy context
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  const refresh = () => setItems(getCart());

  useEffect(() => {
    refresh();
    window.addEventListener("cart-updated", refresh);
    return () => window.removeEventListener("cart-updated", refresh);
  }, []);

  const handleQty = (stockId: number, qty: number) => {
    if (qty < 1) return;
    updateCartItem(stockId, qty);
    refresh();
  };

  const handleRemove = (stockId: number) => {
    removeFromCart(stockId);
    refresh();
    toast.success("Removed from cart");
  };

  const handleCheckout = async () => {
    const session = getSession();
    if (!session || items.length === 0) return;
    setSubmitting(true);
    try {
      // Include the selected payment method in the order body.
      // Backend stores it as a string on the Order entity.
      await api.post("/orders/new", {
        customer_id: session.userId,
        paymentMethod: paymentMethod,
        ordered_items: items.map((it) => ({
          stock_id: it.stock_id,
          amount: it.amount,
        })),
      });
      clearCart();
      refresh();
      const methodLabel = paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment";
      toast.success(`Order placed! (${methodLabel})`);
      router.push("/my-orders");
    } catch (e: any) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const total = cartTotal();

  return (
    <ProtectedLayout allowedRoles={["customer"]}>
      <PageHeader title="Your Cart" description="Review your items and choose a payment method" />

      {items.length === 0 ? (
        <Empty
          icon={<ShoppingCart className="w-6 h-6" />}
          title="Your cart is empty"
          description="Browse our medicines and add some to your cart"
          action={
            <Button onClick={() => router.push("/shop")}>
              Browse Medicines
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: cart items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.stock_id} className="card flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-ink-900">{item.name}</h3>
                  <p className="text-xs text-ink-500 mt-1">{formatPrice(item.price)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-ink-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQty(item.stock_id, item.amount - 1)}
                      className="px-3 py-1 hover:bg-ink-50 text-ink-600"
                      disabled={item.amount <= 1}
                    >−</button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[2.5rem] text-center">
                      {item.amount}
                    </span>
                    <button
                      onClick={() => handleQty(item.stock_id, Math.min(item.amount + 1, item.maxCount))}
                      className="px-3 py-1 hover:bg-ink-50 text-ink-600"
                      disabled={item.amount >= item.maxCount}
                    >+</button>
                  </div>
                  <p className="font-semibold text-sm text-ink-900 min-w-[5rem] text-right">
                    {formatPrice(item.price * item.amount)}
                  </p>
                  <button
                    onClick={() => handleRemove(item.stock_id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right column: order summary + payment method + place order */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit">
            {/* Order summary card */}
            <div className="card">
              <h3 className="font-semibold text-base mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Items ({items.length})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <div className="pt-3 border-t border-ink-100 flex justify-between font-bold text-base text-ink-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment method selection card - per teacher feedback (issue 2) */}
            <div className="card">
              <h3 className="font-semibold text-base mb-4">Select Payment Method</h3>
              <div className="space-y-2">
                <PaymentOption
                  value="COD"
                  label="Cash on Delivery"
                  description="Pay in cash when your order arrives"
                  icon={<Banknote className="w-5 h-5" />}
                  selected={paymentMethod === "COD"}
                  onSelect={() => setPaymentMethod("COD")}
                />
                <PaymentOption
                  value="ONLINE"
                  label="Online Payment"
                  description="Pay now using UPI, card, or net banking"
                  icon={<CreditCard className="w-5 h-5" />}
                  selected={paymentMethod === "ONLINE"}
                  onSelect={() => setPaymentMethod("ONLINE")}
                />
              </div>

              <Button
                onClick={handleCheckout}
                loading={submitting}
                className="w-full mt-6"
              >
                Place Order
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}

/**
 * Small reusable payment option component — a styled radio button.
 * Visually highlights the selected option with brand color border + background.
 */
function PaymentOption({
  value,
  label,
  description,
  icon,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition text-left ${
        selected
          ? "border-brand-600 bg-brand-50"
          : "border-ink-200 hover:border-ink-300 bg-white"
      }`}
    >
      <div
        className={`mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 ${
          selected ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm text-ink-900">{label}</p>
          {/* Radio circle indicator */}
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selected ? "border-brand-600" : "border-ink-300"
            }`}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-brand-600" />}
          </div>
        </div>
        <p className="text-xs text-ink-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
}
