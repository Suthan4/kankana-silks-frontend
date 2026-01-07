"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
        </div>

        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={cn(
              "font-medium",
              trend === "up" ? "text-emerald-600" : "text-red-600"
            )}
          >
            {trend === "up" ? "▲" : "▼"} {trendValue}
          </span>
          <span className="text-muted-foreground">from last period</span>
        </div>
      )}
    </div>
  );
}
