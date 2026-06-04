import type { ReactNode } from "react";

export function AdminCard({
  children,
  className = "",
  glow = false,
  scrollable,
  maxHeight
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  scrollable?: boolean;
  maxHeight?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${glow ? "admin-glow-card-strong" : "admin-glow-card"} ${scrollable ? "admin-scrollbar overflow-y-auto" : ""} ${className}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {children}
    </div>
  );
}
