"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Pill,
  ShoppingCart,
  Receipt,
  Users,
  Package,
  ClipboardList,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { clearSession, getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["customer", "employee", "admin"] },
  { label: "Browse Medicines", href: "/shop", icon: Pill, roles: ["customer"] },
  { label: "My Cart", href: "/cart", icon: ShoppingCart, roles: ["customer"] },
  { label: "My Orders", href: "/my-orders", icon: ClipboardList, roles: ["customer"] },
  { label: "Manage Stock", href: "/admin/stock", icon: Package, roles: ["admin"] },
  { label: "Customers", href: "/admin/customers", icon: Users, roles: ["admin"] },
  { label: "All Orders", href: "/admin/orders", icon: ClipboardList, roles: ["admin"] },
  { label: "All Invoices", href: "/employee/invoices", icon: Receipt, roles: ["admin", "employee"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();

  if (!session) return null;

  const items = NAV.filter((item) => item.roles.includes(session.role));

  const handleLogout = () => {
    clearSession();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-ink-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-ink-900">MediStock</h1>
            <p className="text-[10px] text-ink-500 uppercase tracking-wider">Pharmacy System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-ink-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-ink-900 truncate">{session.username}</p>
          <p className="text-[10px] text-ink-500 uppercase tracking-wider">{session.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
