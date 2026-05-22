import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, TrendingUp, Repeat2, Bug, Newspaper, Home, BarChart3, User, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "হোম — কৃষিবন্ধু" }] }),
});

type Profile = { name: string; district: string | null };

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return navigate({ to: "/login" });
      const { data: p } = await supabase
        .from("profiles").select("name, district")
        .eq("id", data.session.user.id).maybeSingle();
      if (!p?.district) return navigate({ to: "/register" });
      setProfile(p as Profile);
    })();
  }, [navigate]);

  const cards = [
    { label: "বাজার দর", icon: TrendingUp, bg: "bg-[#2D6A4F]", fg: "text-white" },
    { label: "বিনিময়", icon: Repeat2, bg: "bg-[#1E5F8E]", fg: "text-white" },
    { label: "রোগ শনাক্ত", icon: Bug, bg: "bg-[#E07A2C]", fg: "text-white" },
    { label: "সংবাদ ফিড", icon: Newspaper, bg: "bg-[#0E8B8B]", fg: "text-white" },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="px-5 pt-10 pb-16 rounded-b-3xl" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/95">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">{profile?.district ?? "—"}</span>
          </div>
          <button className="relative h-10 w-10 rounded-full bg-white/15 flex items-center justify-center ring-2 ring-white/20">
            <Bell className="h-5 w-5 text-white" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-400" />
          </button>
        </div>
        <div className="mt-5">
          <p className="text-sm text-white/80">স্বাগতম,</p>
          <h1 className="text-2xl font-bold text-white truncate">{profile?.name || "কৃষক"}</h1>
        </div>
      </header>

      <section className="px-5 -mt-10">
        <div className="grid grid-cols-2 gap-3">
          {cards.map(({ label, icon: Icon, bg, fg }) => (
            <button
              key={label}
              className={`${bg} ${fg} aspect-square rounded-2xl p-4 flex flex-col justify-between shadow-[var(--shadow-card)] active:scale-95 transition`}
            >
              <Icon className="h-9 w-9" strokeWidth={2.2} />
              <span className="text-lg font-bold text-left leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold text-foreground mb-3">আজকের তথ্য</h2>
        <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] border border-border">
          <p className="text-sm text-muted-foreground">সংবাদ ফিড শীঘ্রই আসছে। আপনার এলাকার সর্বশেষ কৃষি সংবাদ এখানে দেখা যাবে।</p>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {[
            { label: "হোম", icon: Home, to: "/dashboard", active: true },
            { label: "দর", icon: BarChart3, to: "/dashboard", active: false },
            { label: "বিনিময়", icon: Repeat2, to: "/dashboard", active: false },
            { label: "প্রোফাইল", icon: User, to: "/dashboard", active: false },
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