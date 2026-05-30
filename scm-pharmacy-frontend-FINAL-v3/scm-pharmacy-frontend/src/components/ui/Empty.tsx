"use client";

import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function Empty({ icon, title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-400 mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      {description && <p className="text-sm text-ink-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
