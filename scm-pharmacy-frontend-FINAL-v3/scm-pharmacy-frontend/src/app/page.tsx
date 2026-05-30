"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { Spinner } from "@/components/ui/Spinner";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(isLoggedIn() ? "/dashboard" : "/login");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}
