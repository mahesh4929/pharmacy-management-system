import axios from "axios";
import { getSession, clearSession } from "./auth";

// Base API URL from environment, defaults to localhost:8080
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const session = getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  }
  return config;
});

// Handle 401/403 — token expired or invalid -> log user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      if (status === 401) {
        clearSession();
        // Redirect to login if we're not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to extract a clean error message from API response
export function extractErrorMessage(error: any): string {
  if (error.response?.data?.fieldErrors) {
    const fields = error.response.data.fieldErrors;
    return Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Unknown error"
  );
}
