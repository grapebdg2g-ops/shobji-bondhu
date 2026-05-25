import { Skeleton } from "@/components/ui/skeleton";

export function PriceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-2 items-end flex flex-col">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}