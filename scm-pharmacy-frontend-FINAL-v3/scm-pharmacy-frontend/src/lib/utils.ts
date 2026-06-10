import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null) return "₹0.00";
  return `₹${price.toFixed(2)}`;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function statusColor(status: string): string {
  const s = status?.toLowerCase() || "";
  if (s === "fulfilled") return "bg-green-100 text-green-700";
  if (s === "in progress") return "bg-blue-100 text-blue-700";
  if (s === "paid") return "bg-purple-100 text-purple-700";
  return "bg-amber-100 text-amber-700"; // unfulfilled
}

/**
 * Formats yyyy-MM-dd expiry date string as "23 May 2027" for display.
 * Returns "—" if no expiry date is set.
 */
export function formatExpiry(expiryDate: string | undefined | null): string {
  if (!expiryDate) return "—";
  try {
    // Append T00:00 so the browser doesn't shift the date by timezone
    const d = new Date(expiryDate + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return expiryDate;
  }
}

/**
 * Returns a Tailwind class for the expiry status badge:
 * - red if already expired
 * - amber if expiring within 30 days
 * - green if more than 30 days away
 * - gray if no date set
 */
export function expiryStatus(expiryDate: string | undefined | null): {
  label: string;
  className: string;
} {
  if (!expiryDate) {
    return { label: "No expiry set", className: "bg-ink-100 text-ink-500" };
  }
  try {
    const expiry = new Date(expiryDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = expiry.getTime() - today.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return {
        label: `Expired ${Math.abs(days)}d ago`,
        className: "bg-red-100 text-red-700",
      };
    }
    if (days === 0) {
      return { label: "Expires today", className: "bg-red-100 text-red-700" };
    }
    if (days <= 30) {
      return { label: `Expires in ${days}d`, className: "bg-amber-100 text-amber-700" };
    }
    return { label: `${days}d left`, className: "bg-green-100 text-green-700" };
  } catch {
    return { label: "Invalid date", className: "bg-ink-100 text-ink-500" };
  }
}

/**
 * Returns ONLY the coarse expiry-status flag for the dedicated status column.
 * Distinct from expiryStatus() above, which produces the day-count badge
 * shown next to the date. This one answers a single question for the admin:
 * "what category is this medicine in?" — matching the backend's
 * EXPIRED / CRITICAL (<=15d) / EXPIRING_SOON (<=30d) / OK statuses.
 *
 * `withinThreshold` is true when the medicine needs admin attention
 * (expired OR expiring within 30 days), used to build the filtered list.
 */
export function expiryFlag(expiryDate: string | undefined | null): {
  label: string;
  className: string;
  withinThreshold: boolean;
} {
  if (!expiryDate) {
    return { label: "—", className: "bg-ink-100 text-ink-500", withinThreshold: false };
  }
  try {
    const expiry = new Date(expiryDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { label: "Expired", className: "bg-red-100 text-red-700", withinThreshold: true };
    }
    if (days <= 15) {
      return { label: "Critical", className: "bg-red-100 text-red-700", withinThreshold: true };
    }
    if (days <= 30) {
      return { label: "Expiring Soon", className: "bg-amber-100 text-amber-700", withinThreshold: true };
    }
    return { label: "OK", className: "bg-green-100 text-green-700", withinThreshold: false };
  } catch {
    return { label: "—", className: "bg-ink-100 text-ink-500", withinThreshold: false };
  }
}
