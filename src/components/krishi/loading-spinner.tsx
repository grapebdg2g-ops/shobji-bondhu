import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  label = "লোড হচ্ছে...",
  className,
  size = 24,
}: { label?: string; className?: string; size?: number }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground", className)}>
      <Loader2 className="animate-spin text-primary" style={{ width: size, height: size }} />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  );
}