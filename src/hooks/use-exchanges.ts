import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Exchange = Tables<"exchanges">;
export type ExchangeType = "seed" | "sapling" | "tool" | "labor";

export type ExchangeFilters = {
  district: string | null;
  type: ExchangeType | "all";
  query: string;
  freeOnly: boolean;
  sort: "newest" | "cheapest";
};

export function useExchanges(filters: ExchangeFilters) {
  const [items, setItems] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    let q = supabase
      .from("exchanges")
      .select("*")
      .eq("is_active", true)
      .limit(100);
    if (filters.district) q = q.eq("district", filters.district);
    if (filters.type !== "all") q = q.eq("type", filters.type);
    if (filters.freeOnly) q = q.eq("is_free", true);
    q = filters.sort === "cheapest"
      ? q.order("is_free", { ascending: false }).order("price", { ascending: true, nullsFirst: false })
      : q.order("created_at", { ascending: false });
    const { data, error: e } = await q;
    if (e) setError("তালিকা লোড করা যায়নি");
    else setItems((data ?? []) as Exchange[]);
    setLoading(false);
  }, [filters.district, filters.type, filters.freeOnly, filters.sort]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("exchanges-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "exchanges" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      i.title.toLowerCase().includes(q) ||
      (i.description ?? "").toLowerCase().includes(q),
    );
  }, [items, filters.query]);

  const addOptimistic = useCallback((item: Exchange) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const replaceOptimistic = useCallback((tempId: string, real: Exchange) => {
    setItems((prev) => prev.map((i) => (i.id === tempId ? real : i)));
  }, []);

  const removeOptimistic = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items: filtered, loading, error, refresh: load, addOptimistic, replaceOptimistic, removeOptimistic };
}