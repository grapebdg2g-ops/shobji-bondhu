import { Sprout } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-8 text-center">
      <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-accent/15 flex items-center justify-center text-primary">
        {icon ?? <Sprout className="h-8 w-8" />}
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}