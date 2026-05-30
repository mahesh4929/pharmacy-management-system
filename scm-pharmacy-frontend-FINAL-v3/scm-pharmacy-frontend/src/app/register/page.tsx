"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pill, ShieldCheck, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { api, extractErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Public self-registration page for NEW customers.
 * Calls POST /customers/register (no JWT required).
 * After successful registration, auto-logs the user in by calling /login/customer
 * so they land directly on the dashboard.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Centralized form field setter — same pattern as controlled inputs
  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [key]: e.target.value });
  };

  // Client-side validation before hitting the API.
  // The backend ALSO validates (Bean Validation + custom checks), this is just for UX.
  const validate = (): string | null => {
    if (form.password.length < 4) return "Password must be at least 4 characters";
    if (form.password !== form.confirmPassword) return "Passwords don't match";
    if (form.username.length < 3) return "Username must be at least 3 characters";
    if (!/^\d{10}$/.test(form.phoneNumber)) return "Phone number must be 10 digits";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    try {
      // Step 1: Register the new customer (public endpoint, no token)
      // The backend expects credentials nested as an object with username/password
      await api.post("/customers/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        phoneNumber: form.phoneNumber,
        active: true,
        credentials: {
          username: form.username,
          password: form.password,
        },
      });

      // Teacher feedback: don't auto-login; redirect to login so user explicitly
      // signs in with their new credentials. This is the safer, more explicit pattern
      // that confirms their account works before they enter the app.
      toast.success("Account created! Please sign in with your new credentials.");
      router.push("/login");
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding (same style as login for consistency) */}
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
            Join thousands<br />of pharmacy<br />customers.
          </h2>
          <p className="text-brand-100 text-lg max-w-md">
            Create your account in seconds. Browse medicines, place orders, and track deliveries.
          </p>
          <div className="mt-12 flex items-center gap-3 text-sm text-brand-100">
            <ShieldCheck className="w-5 h-5" />
            <span>Your password is encrypted with BCrypt before storage</span>
          </div>
        </div>
      </div>

      {/* Right side - registration form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Back to login link */}
          <Link href="/login" className="inline-flex items-center text-sm text-ink-500 hover:text-brand-600 mb-6 transition">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Link>

          <h2 className="text-2xl font-bold text-ink-900 mb-1">Create your account</h2>
          <p className="text-ink-500 mb-6">Sign up as a new customer to start ordering</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={setField("firstName")}
                placeholder="John"
                required
                autoComplete="given-name"
              />
              <Input
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={setField("lastName")}
                placeholder="Doe"
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={setField("address")}
              placeholder="123 MG Road, Pune"
              required
              autoComplete="street-address"
            />

            <Input
              label="Phone number"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={setField("phoneNumber")}
              placeholder="9876543210"
              required
              autoComplete="tel"
              maxLength={10}
            />

            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={setField("username")}
              placeholder="Choose a unique username"
              required
              autoComplete="username"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={setField("password")}
                placeholder="At least 4 chars"
                required
                autoComplete="new-password"
              />
              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={setField("confirmPassword")}
                placeholder="Re-type password"
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
