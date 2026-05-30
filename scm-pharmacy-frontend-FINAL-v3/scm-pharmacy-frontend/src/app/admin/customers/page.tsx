"use client";

import { useEffect, useState } from "react";
import { Users, Search, User } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Customer } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Customer[]>("/customers");
        setCustomers(data || []);
      } catch (e: any) {
        toast.error(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber?.includes(search)
  );

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <PageHeader title="Customers" description="View all registered customers" />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty icon={<Users className="w-6 h-6" />} title="No customers found" />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 text-xs text-ink-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Address</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Member Since</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-ink-100 hover:bg-ink-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                        {c.firstName?.[0]?.toUpperCase()}{c.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-ink-500">ID #{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-700">{c.phoneNumber}</td>
                  <td className="py-3 px-4 text-sm text-ink-600 max-w-xs truncate">{c.address}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${c.active !== false ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-500"}`}>
                      {c.active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-ink-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ProtectedLayout>
  );
}
