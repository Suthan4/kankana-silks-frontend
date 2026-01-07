"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

type Status =
  | "success"
  | "pending"
  | "failed"
  | "cancelled"
  | "processing"
  | "active"
  | "inactive"
  | "refunded";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400",
  pending:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400",
  processing:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-400",
  failed:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-400",
  cancelled:
    "bg-zinc-100 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-900 dark:text-zinc-400",
  refunded:
    "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950 dark:text-purple-400",
  active:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400",
  inactive:
    "bg-zinc-100 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-900 dark:text-zinc-400",
};

export default function StatusBadge({
  status,
  label,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
        statusStyles[status],
        className
      )}
    >
      {label ?? status.replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
}
