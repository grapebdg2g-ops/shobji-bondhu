import { AlertCircle, RefreshCw } from "lucide-react";
import { BengaliButton } from "./bengali-button";

export function ErrorMessage({
  title = "সংযোগ সমস্যা, আবার চেষ্টা করুন",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-card border border-destructive/30 p-6 text-center">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <BengaliButton variant="outline" size="md" onClick={onRetry} className="mt-4" leftIcon={<RefreshCw className="h-4 w-4" />}>
          আবার চেষ্টা করুন
        </BengaliButton>
      )}
    </div>
  );
}