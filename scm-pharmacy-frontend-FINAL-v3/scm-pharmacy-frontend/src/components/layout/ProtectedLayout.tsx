"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { Spinner } from "../ui/Spinner";

interface ProtectedLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      router.push("/dashboard");
      return;
    }
    setChecking(false);
  }, [router, allowedRoles]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
