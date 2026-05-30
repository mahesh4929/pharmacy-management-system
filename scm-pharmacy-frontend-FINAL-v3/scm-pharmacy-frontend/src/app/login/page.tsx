"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pill, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoginResponse } from "@/lib/types";

type Tab = "customer" | "employee";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("customer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = tab === "customer" ? "/login/customer" : "/login/employee";
      const { data } = await api.post<LoginResponse>(endpoint, { username, password });
      const session = saveSession(data.token);
      if (!session) {
        toast.error("Invalid token received");
        return;
      }
      toast.success(`Welcome, ${session.username}`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillSample = () => {
    if (tab === "customer") {
      setUsername("jcustomer");
      setPassword("password");
    } else {
      setUsername("jchiarella");
      setPassword("jasonspassword");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 0%, transparent 50%), radial-gradient(circle at 80% 70%, white 0%, transparent 50%)"
        }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Pill className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold">MediStock</h1>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Pharmacy<br />management,<br />reimagined.
          </h2>
          <p className="text-brand-100 text-lg max-w-md">
            Track inventory in real-time, process orders, manage invoices — all in one place.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-brand-100">
            <ShieldCheck className="w-5 h-5" />
            <span>Secure JWT-based authentication · BCrypt password hashing</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-ink-900">MediStock</h1>
          </div>

          <h2 className="text-2xl font-bold text-ink-900 mb-1">Welcome back</h2>
          <p className="text-ink-500 mb-8">Sign in to continue to your account</p>

          {/* Tabs */}
          <div className="flex p-1 bg-ink-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setTab("customer")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                tab === "customer" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setTab("employee")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                tab === "employee" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
              }`}
            >
              Employee
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <button
            onClick={fillSample}
            type="button"
            className="mt-6 w-full text-xs text-ink-500 hover:text-brand-600 transition"
          >
            Use sample {tab} credentials
          </button>

          {/* Self-registration link — only shown for customers.
              Employees are created by an admin, not via self-signup. */}
          {tab === "customer" && (
            <div className="mt-6 pt-6 border-t border-ink-100 text-center">
              <p className="text-sm text-ink-500">
                New to MediStock?{" "}
                <Link
                  href="/register"
                  className="text-brand-600 hover:text-brand-800 font-medium"
                >
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
