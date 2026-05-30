"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Receipt, Users, ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { Stock, Invoice, Customer, Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  href?: string;
}

function StatCard({ label, value, icon: Icon, color, href }: StatCardProps) {
  const card = (
    <div className="card hover:shadow-card-hover transition cursor-pointer group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="text-3xl font-bold text-ink-900 mt-2">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {href && (
        <div className="mt-4 flex items-center text-sm text-brand-600 font-medium group-hover:gap-2 transition-all">
          View details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const session = typeof window !== "undefined" ? getSession() : null;

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const stockRes = await api.get<Stock[]>("/stock");
        setStocks(stockRes.data || []);

        if (session.role === "customer") {
          try {
            const ordRes = await api.get<Order[]>(`/orders/customer/${session.userId}`);
            setOrders(ordRes.data || []);
          } catch {}
          try {
            const invRes = await api.get<Invoice[]>(`/invoices/customer/${session.userId}`);
            setInvoices(invRes.data || []);
          } catch {}
        } else {
          try {
            const cusRes = await api.get<Customer[]>("/customers");
            setCustomers(cusRes.data || []);
          } catch {}
          try {
            const invRes = await api.get<Invoice[]>(`/invoices/employee/${session.userId}`);
            setInvoices(invRes.data || []);
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.userId, session?.role]);

  return (
    <ProtectedLayout>
      <PageHeader
        title={`Welcome back, ${session?.username || ""}`}
        description={`Here's what's happening with your ${session?.role === "customer" ? "account" : "store"} today.`}
      />

      {loading ? (
        <Spinner />
      ) : session?.role === "customer" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Available Medicines"
            value={stocks.filter((s) => s.active !== false).length}
            icon={Package}
            color="bg-brand-600"
            href="/shop"
          />
          <StatCard
            label="My Orders"
            value={orders.length}
            icon={ShoppingCart}
            color="bg-emerald-600"
            href="/my-orders"
          />
          <StatCard
            label="Total Spent"
            value={formatPrice(invoices.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0))}
            icon={TrendingUp}
            color="bg-purple-600"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Medicines"
            value={stocks.length}
            icon={Package}
            color="bg-brand-600"
            href={session?.role === "admin" ? "/admin/stock" : "/employee/invoices"}
          />
          <StatCard
            label="Active Stock"
            value={stocks.filter((s) => s.active !== false).length}
            icon={TrendingUp}
            color="bg-emerald-600"
          />
          <StatCard
            label="Customers"
            value={customers.length}
            icon={Users}
            color="bg-amber-600"
            href={session?.role === "admin" ? "/admin/customers" : undefined}
          />
          <StatCard
            label="My Invoices"
            value={invoices.length}
            icon={Receipt}
            color="bg-purple-600"
            href="/employee/invoices"
          />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-base font-semibold mb-4">Quick actions</h3>
          <div className="space-y-2">
            {session?.role === "customer" && (
              <>
                <Link href="/shop" className="block p-3 rounded-lg hover:bg-ink-50 transition">
                  <p className="font-medium text-sm">Browse Medicines</p>
                  <p className="text-xs text-ink-500">View available medicines and prices</p>
                </Link>
                <Link href="/my-orders" className="block p-3 rounded-lg hover:bg-ink-50 transition">
                  <p className="font-medium text-sm">View Order History</p>
                  <p className="text-xs text-ink-500">Track your past orders</p>
                </Link>
              </>
            )}
            {session?.role === "admin" && (
              <>
                <Link href="/admin/stock" className="block p-3 rounded-lg hover:bg-ink-50 transition">
                  <p className="font-medium text-sm">Add New Medicine</p>
                  <p className="text-xs text-ink-500">Expand the catalog</p>
                </Link>
                <Link href="/admin/customers" className="block p-3 rounded-lg hover:bg-ink-50 transition">
                  <p className="font-medium text-sm">View Customers</p>
                  <p className="text-xs text-ink-500">See all registered customers</p>
                </Link>
              </>
            )}
            {session?.role === "employee" && (
              <Link href="/employee/invoices" className="block p-3 rounded-lg hover:bg-ink-50 transition">
                <p className="font-medium text-sm">Fulfill Invoices</p>
                <p className="text-xs text-ink-500">Process pending invoices</p>
              </Link>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold mb-4">System status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-ink-500">Backend API</span>
              <span className="badge bg-green-100 text-green-700">● Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-500">Authentication</span>
              <span className="badge bg-green-100 text-green-700">● Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-500">Your Role</span>
              <span className="badge bg-brand-100 text-brand-700 capitalize">{session?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
