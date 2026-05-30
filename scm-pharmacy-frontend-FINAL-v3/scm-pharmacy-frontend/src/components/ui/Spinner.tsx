"use client";

import { Loader2 } from "lucide-react";

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="animate-spin text-brand-600" size={size} />
    </div>
  );
}
