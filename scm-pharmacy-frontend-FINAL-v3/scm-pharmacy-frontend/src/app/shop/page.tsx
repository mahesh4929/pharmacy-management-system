"use client";

import { useEffect, useState } from "react";
import { Pill, Plus, Search, ShoppingCart, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { api, extractErrorMessage } from "@/lib/api";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Stock } from "@/lib/types";
import { formatPrice, formatExpiry, expiryStatus } from "@/lib/utils";
import { addToCart } from "@/lib/cart";

/**
 * Customer's medicine browsing page.
 *
 * Per teacher feedback (issue 4): expired medicines are clearly marked and
 * cannot be added to cart. The "EXPIRED" badge replaces the normal expiry
 * status badge, and the Add button is disabled with helper text.
 *
 * Per teacher feedback (issue 2): the old "Order Now" instant-order button
 * was removed. All ordering now goes through the cart -> payment -> place
 * order flow. The Add button is the primary blue action.
 */
export default function ShopPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Stock[]>("/stock");
        setStocks(data.filter((s) => s.active !== false));
      } catch (e: any) {
        toast.error(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = stocks.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Returns true if the medicine has passed its expiry date.
  // Customers must not be able to add expired medicines to their cart.
  const isExpired = (expiryDate: string | undefined): boolean => {
    if (!expiryDate) return false;
    try {
      const expiry = new Date(expiryDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expiry.getTime() < today.getTime();
    } catch {
      return false;
    }
  };

  const handleAdd = (stock: Stock) => {
    // Defensive: even though button is disabled when expired, guard the handler too
    if (isExpired(stock.expiryDate)) {
      toast.error("This medicine is expired and cannot be ordered");
      return;
    }
    if (stock.count <= 0) {
      toast.error("Out of stock");
      return;
    }
    addToCart({
      stock_id: stock.id,
      name: stock.name,
      price: stock.price,
      amount: 1,
      maxCount: stock.count,
    });
    toast.success(`${stock.name} added to cart`);
  };

  return (
    <ProtectedLayout allowedRoles={["customer"]}>
      <PageHeader
        title="Browse Medicines"
        description="Find what you need from our pharmacy catalog"
        actions={
          <Link href="/cart">
            <Button variant="secondary">
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart
            </Button>
          </Link>
        }
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
          icon={<Pill className="w-6 h-6" />}
          title="No medicines found"
          description={search ? "Try a different search term" : "Catalog is empty"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((stock) => {
            const expired = isExpired(stock.expiryDate);
            const exp = expiryStatus(stock.expiryDate);
            return (
              <div
                key={stock.id}
                className={`card hover:shadow-card-hover transition flex flex-col ${
                  expired ? "opacity-75 ring-1 ring-red-200" : ""
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      expired
                        ? "bg-red-50 text-red-600"
                        : "bg-brand-50 text-brand-600"
                    }`}
                  >
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-ink-900 truncate">
                      {stock.name}
                    </h3>
                    <p className="text-xs text-ink-500 mt-1 line-clamp-2">
                      {stock.description}
                    </p>
                  </div>
                </div>

                {/* Expiry info — shown prominently. For expired meds we use a bold
                    EXPIRED label so customers immediately understand why they can't order. */}
                {stock.expiryDate && (
                  <div className="mb-3 flex items-center justify-between gap-2 px-2 py-1.5 rounded-md bg-ink-50">
                    <div className="text-[10px] text-ink-500">
                      <span className="block">Expires</span>
                      <span className="font-medium text-ink-700">
                        {formatExpiry(stock.expiryDate)}
                      </span>
                    </div>
                    {expired ? (
                      <span className="badge bg-red-600 text-white font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        EXPIRED
                      </span>
                    ) : (
                      <span className={`badge ${exp.className}`}>{exp.label}</span>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-ink-100">
                  <div className="mb-3">
                    <p className="text-lg font-bold text-ink-900">
                      {formatPrice(stock.price)}
                    </p>
                    <p className="text-[10px] text-ink-500">
                      {stock.count > 0
                        ? `${stock.count} in stock`
                        : "Out of stock"}
                    </p>
                  </div>
                  {/* Single primary Add button (Order Now removed per teacher feedback).
                      Disabled and labelled differently when expired so the user understands why. */}
                  <Button
                    onClick={() => handleAdd(stock)}
                    disabled={expired || stock.count <= 0}
                    className="w-full"
                  >
                    {expired ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Cannot Order (Expired)
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ProtectedLayout>
  );
}
