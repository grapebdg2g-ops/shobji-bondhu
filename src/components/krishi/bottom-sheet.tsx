import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 animate-in fade-in" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full bg-card rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="h-10 w-10 rounded-full bg-muted flex items-center justify-center active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}