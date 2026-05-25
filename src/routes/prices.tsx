import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Plus, MapPin, TrendingUp, TrendingDown,
  Home, BarChart3, Repeat2, User, Sprout,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DISTRICTS } from "@/lib/bd-data";
import { toast } from "sonner";
import { useUser } from "@/contexts/user-context";
import { BengaliButton } from "@/components/krishi/bengali-button";
import { ErrorMessage } from "@/components/krishi/error-message";
import { EmptyState } from "@/components/krishi/empty-state";
import { BottomSheet } from "@/components/krishi/bottom-sheet";
import { PriceCardSkeleton } from "@/components/krishi/price-card-skeleton";

export const Route = createFileRoute("/prices")({
  component: PricesPage,
  head: () => ({ meta: [{ title: "বাজার দর — কৃষিবন্ধু" }] }),
});

type Price = {
  id: string;
  product_name: string;
  price: number;
  unit: string;
  market_name: string;
  district: string;
  category: string;
  user_name: string;
  previous_price: number | null;
  created_at: string;
};

const CATEGORIES = ["সব", "ধান", "সবজি", "ফল", "মসলা"] as const;
const UNITS = ["কেজি", "মণ", "পিস", "লিটার"] as const;

const BN_DIGITS = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);

const BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
function bnDate(d = new Date()) {
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${toBn(d.getFullYear())}`;
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${toBn(s)} সেকেন্ড আগে`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${toBn(m)} মিনিট আগে`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${toBn(h)} ঘণ্টা আগে`;
  const d = Math.floor(h / 24);
  return `${toBn(d)} দিন আগে`;
}

function PricesPage() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [district, setDistrict] = useState<string>("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("সব");
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!user.district) { navigate({ to: "/register" }); return; }
    if (!district) setDistrict(user.district);
  }, [user, userLoading, district, navigate]);

  const loadPrices = useCallback(async (d: string) => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from("prices")
      .select("*")
      .eq("district", d)
      .order("created_at", { ascending: false })
      .limit(50);
    if (e) {
      setError("সংযোগ সমস্যা, আবার চেষ্টা করুন");
      setPrices([]);
    } else {
      setPrices((data as Price[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!district) return;
    loadPrices(district);

    const ch = supabase
      .channel(`prices-${district}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "prices", filter: `district=eq.${district}` },
        (payload) => {
          setPrices((cur) => [payload.new as Price, ...cur].slice(0, 50));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [district, loadPrices]);

  const filtered = useMemo(() => {
    if (category === "সব") return prices;
    return prices.filter((p) => p.category === category);
  }, [prices, category]);

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-10 pb-5 rounded-b-3xl" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex items-center gap-3 text-white">
          <Link to="/dashboard" className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">বাজার দর</h1>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 relative">
            <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full appearance-none bg-white text-foreground font-semibold rounded-xl pl-9 pr-4 py-3 text-sm shadow-[var(--shadow-card)]"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="text-white/90 text-xs text-right leading-tight">
            <div className="opacity-80">আজ</div>
            <div className="font-semibold">{bnDate()}</div>
          </div>
        </div>
      </header>

      {/* Filter chips */}
      <div className="px-5 mt-4 -mb-1 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price list */}
      <section className="px-5 mt-4 space-y-3">
        {loading ? (
          <>
            <PriceCardSkeleton />
            <PriceCardSkeleton />
            <PriceCardSkeleton />
            <PriceCardSkeleton />
          </>
        ) : error ? (
          <ErrorMessage onRetry={() => loadPrices(district)} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Sprout className="h-8 w-8" />}
            title="কোনো দাম পাওয়া যায়নি"
            description="এই জেলায় এখনো কোনো দাম যোগ হয়নি।"
            action={
              <BengaliButton variant="warning" size="md" onClick={() => setOpen(true)} leftIcon={<Plus className="h-5 w-5" />}>
                প্রথম দাম যোগ করুন
              </BengaliButton>
            }
          />
        ) : (
          filtered.map((p) => {
            const diff = p.previous_price != null ? p.price - p.previous_price : 0;
            return (
              <article key={p.id} className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-foreground truncate">{p.product_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{p.market_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-2xl font-extrabold text-primary leading-none">
                        ৳{toBn(p.price)}
                      </span>
                      {diff > 0 && <TrendingUp className="h-5 w-5 text-red-500" />}
                      {diff < 0 && <TrendingDown className="h-5 w-5 text-green-600" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">প্রতি {p.unit}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                  <span>{p.user_name || "অজ্ঞাত"}</span>
                  <span>{timeAgo(p.created_at)}</span>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 h-14 w-14 rounded-full bg-[#E07A2C] text-white shadow-lg flex items-center justify-center active:scale-95 transition"
        aria-label="দাম যোগ করুন"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {[
            { label: "হোম", icon: Home, to: "/dashboard" as const, active: false },
            { label: "দর", icon: BarChart3, to: "/prices" as const, active: true },
            { label: "বিনিময়", icon: Repeat2, to: "/dashboard" as const, active: false },
            { label: "প্রোফাইল", icon: User, to: "/dashboard" as const, active: false },
          ].map(({ label, icon: Icon, to, active }) => (
            <Link key={label} to={to}
              className={`flex flex-col items-center gap-1 py-3 ${active ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-xs ${active ? "font-bold" : "font-medium"}`}>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Add price sheet */}
      {user && (
        <AddPriceSheet
          open={open}
          profile={{ id: user.id, name: user.name, district: user.district ?? "" }}
          defaultDistrict={district}
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  );
}

function AddPriceSheet({
  open, profile, defaultDistrict, onClose,
}: {
  open: boolean;
  profile: { id: string; name: string; district: string };
  defaultDistrict: string;
  onClose: () => void;
}) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<(typeof UNITS)[number]>("কেজি");
  const [marketName, setMarketName] = useState("");
  const [category, setCategory] = useState("সবজি");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !price || !marketName.trim()) {
      toast.error("সব ঘর পূরণ করুন");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("prices").insert({
      product_name: productName.trim(),
      price: Number(price),
      unit,
      market_name: marketName.trim(),
      district: defaultDistrict || profile.district,
      category,
      user_id: profile.id,
      user_name: profile.name,
    });
    setSubmitting(false);
    if (error) {
      toast.error("সংযোগ সমস্যা, আবার চেষ্টা করুন");
      return;
    }
    toast.success("দাম যোগ হয়েছে");
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="নতুন দাম যোগ করুন">
      <form onSubmit={submit}>
        <div className="space-y-3">
          <Field label="পণ্যের নাম">
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="যেমন: আলু"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="দাম (৳)">
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="০"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base"
              />
            </Field>
            <Field label="একক">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as (typeof UNITS)[number])}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <Field label="বাজারের নাম">
            <input
              value={marketName}
              onChange={(e) => setMarketName(e.target.value)}
              placeholder="যেমন: কারওয়ান বাজার"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base"
            />
          </Field>

          <Field label="শ্রেণি">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base"
            >
              {["ধান","সবজি","ফল","মসলা","অন্যান্য"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="জেলা">
            <input
              value={defaultDistrict || profile.district}
              disabled
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-base text-muted-foreground"
            />
          </Field>
        </div>

        <BengaliButton type="submit" fullWidth loading={submitting} className="mt-5">
          দাম আপডেট করুন
        </BengaliButton>
      </form>
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}