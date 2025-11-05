import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EntityListProps {
  children: ReactNode;
  className?: string;
}

export function EntityList({ children, className }: EntityListProps) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}
