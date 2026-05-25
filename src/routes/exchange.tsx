import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, Plus, Home, BarChart3, Repeat2, User as UserIcon, Sprout, Leaf, Wrench, HardHat } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useExchanges, type ExchangeType, type Exchange } from "@/hooks/use-exchanges";
import { ExchangeCard } from "@/components/krishi/exchange-card";
import { BottomSheet } from "@/components/krishi/bottom-sheet";
import { BengaliButton } from "@/components/krishi/bengali-button";
import { EmptyState } from "@/components/krishi/empty-state";
import { LoadingSpinner } from "@/components/krishi/loading-spinner";
import { DISTRICTS } from "@/lib/bd-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/exchange")({
  component: ExchangePage,
  head: () => ({ meta: [{ title: "বিনিময় — কৃষিবন্ধু" }] }),
});

const TABS: { type: ExchangeType; label: string; icon: typeof Sprout }[] = [
  { type: "seed", label: "বীজ", icon: Sprout },
  { type: "sapling", label: "চারা", icon: Leaf },
  { type: "tool", label: "যন্ত্রপাতি", icon: Wrench },
  { type: "labor", label: "শ্রমিক", icon: HardHat },
];

function ExchangePage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [type, setType] = useState<ExchangeType | "all">("all");
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState<string | null>(user?.district ?? null);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "cheapest">("newest");
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = useMemo(() => ({ district, type, query, freeOnly, sort }), [district, type, query, freeOnly, sort]);
  const { items, loading, addOptimistic, replaceOptimistic, removeOptimistic } = useExchanges(filters);

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="px-4 pt-10 pb-4 rounded-b-3xl" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            aria-label="ফিরে যান"
            className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/20"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">বিনিময়</h1>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="খুঁজুন..."
            className="w-full h-11 pl-10 pr-3 rounded-xl bg-white text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
          />
        </div>
      </header>

      <div className="px-4 mt-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          <TabPill active={type === "all"} onClick={() => setType("all")} label="সব" />
          {TABS.map(({ type: t, label, icon: Icon }) => (
            <TabPill key={t} active={type === t} onClick={() => setType(t)} icon={<Icon className="h-4 w-4" />} label={label} />
          ))}
        </div>
      </div>

      <div className="px-4 mt-3 flex gap-2 flex-wrap">
        <select
          value={district ?? ""}
          onChange={(e) => setDistrict(e.target.value || null)}
          className="h-9 px-3 rounded-lg bg-card border border-border text-sm font-medium"
        >
          <option value="">সব জেলা</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          onClick={() => setFreeOnly((v) => !v)}
          className={`h-9 px-3 rounded-lg border text-sm font-medium ${freeOnly ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border"}`}
        >
          {freeOnly ? "বিনামূল্যে" : "সব মূল্য"}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "cheapest")}
          className="h-9 px-3 rounded-lg bg-card border border-border text-sm font-medium"
        >
          <option value="newest">নতুন প্রথম</option>
          <option value="cheapest">কম দাম প্রথম</option>
        </select>
      </div>

      <section className="px-4 mt-4 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState title="কোনো বিজ্ঞাপন নেই" description="ফিল্টার বদলান বা নতুন বিজ্ঞাপন দিন।" />
        ) : (
          items.map((item) => <ExchangeCard key={item.id} item={item} />)
        )}
      </section>

      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-4 h-14 px-5 rounded-full bg-[#E07A2C] text-white font-bold shadow-lg active:scale-95 inline-flex items-center gap-2"
      >
        <Plus className="h-5 w-5" /> বিজ্ঞাপন দিন
      </button>

      <NewAdSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        defaultDistrict={user?.district ?? "ঢাকা"}
        userId={user?.id ?? null}
        userName={user?.name ?? "কৃষক"}
        userPhone={user?.phone ?? null}
        onOptimistic={addOptimistic}
        onReplace={replaceOptimistic}
        onRollback={removeOptimistic}
      />

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {[
            { label: "হোম", icon: Home, to: "/dashboard" as const, active: false },
            { label: "দর", icon: BarChart3, to: "/prices" as const, active: false },
            { label: "বিনিময়", icon: Repeat2, to: "/exchange" as const, active: true },
            { label: "প্রোফাইল", icon: UserIcon, to: "/dashboard" as const, active: false },
          ].map(({ label, icon: Icon, to, active }) => (
            <Link key={label} to={to}
              className={`flex flex-col items-center gap-1 py-3 ${active ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-xs ${active ? "font-bold" : "font-medium"}`}>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}

function TabPill({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 h-10 text-sm font-medium border-b-2 ${active ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground"}`}
    >
      {icon} {label}
    </button>
  );
}

function NewAdSheet({
  open, onClose, defaultDistrict, userId, userName, userPhone,
  onOptimistic, onReplace, onRollback,
}: {
  open: boolean; onClose: () => void; defaultDistrict: string;
  userId: string | null; userName: string; userPhone: string | null;
  onOptimistic: (i: Exchange) => void;
  onReplace: (tempId: string, real: Exchange) => void;
  onRollback: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ExchangeType>("seed");
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("কেজি");
  const [district, setDistrict] = useState(defaultDistrict);
  const [phone, setPhone] = useState(userPhone ?? "");
  const [saving, setSaving] = useState(false);

  const reset = () => { setTitle(""); setType("seed"); setIsFree(false); setPrice(""); setUnit("কেজি"); };

  const submit = async () => {
    if (!userId) { toast.error("লগইন করুন"); return; }
    if (!title.trim() || !district) { toast.error("সব তথ্য দিন"); return; }
    setSaving(true);
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: Exchange = {
      id: tempId, title: title.trim(), description: null, type,
      is_free: isFree, price: isFree ? null : Number(price) || 0, unit: isFree ? null : unit,
      image_url: null, district, upazila: null,
      user_id: userId, user_name: userName, user_phone: phone || null,
      is_active: true, created_at: new Date().toISOString(),
    };
    onOptimistic(optimistic);
    onClose();
    const { data, error } = await supabase.from("exchanges").insert({
      title: optimistic.title, type, is_free: isFree,
      price: optimistic.price, unit: optimistic.unit,
      district, user_id: userId, user_name: userName, user_phone: phone || null,
    }).select().single();
    setSaving(false);
    if (error || !data) {
      onRollback(tempId);
      toast.error("সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    onReplace(tempId, data as Exchange);
    toast.success("বিজ্ঞাপন পোস্ট হয়েছে");
    reset();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="নতুন বিজ্ঞাপন">
      <div className="space-y-3">
        <Field label="শিরোনাম">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm" placeholder="যেমন: হাইব্রিড টমেটো চারা" />
        </Field>
        <Field label="ধরন">
          <div className="grid grid-cols-4 gap-2">
            {TABS.map(({ type: t, label }) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`h-10 rounded-lg text-sm font-medium border ${type === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                {label}
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="h-4 w-4" />
          বিনামূল্যে
        </label>
        {!isFree && (
          <div className="grid grid-cols-2 gap-2">
            <Field label="মূল্য (৳)">
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" inputMode="decimal" className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm" />
            </Field>
            <Field label="একক">
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
                {["কেজি","মণ","পিস","দিন","ঘণ্টা"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>
        )}
        <Field label="জেলা">
          <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="যোগাযোগ নম্বর (WhatsApp)">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX" className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm" />
        </Field>
        <BengaliButton fullWidth loading={saving} onClick={submit}>পোস্ট করুন</BengaliButton>
      </div>
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}