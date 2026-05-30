import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediStock — Pharmacy Management System",
  description: "Modern pharmacy inventory and order management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f172a",
              color: "#fff",
              fontSize: "14px",
              borderRadius: "10px",
              padding: "12px 16px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
