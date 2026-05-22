import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("district")
        .eq("id", data.session.user.id)
        .maybeSingle();
      navigate({ to: profile?.district ? "/dashboard" : "/register" });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-8 text-center"
      style={{ background: "var(--gradient-brand)" }}
    >
      <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center gap-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm ring-4 ring-white/20 shadow-2xl">
          <Sprout className="h-16 w-16 text-white" strokeWidth={2.2} />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-lg">
          কৃষিবন্ধু
        </h1>
        <p className="text-lg font-medium text-white/90">কৃষকের বিশ্বস্ত সঙ্গী</p>
      </div>
      <div className="absolute bottom-12 flex gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white/80" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-white/80 [animation-delay:200ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-white/80 [animation-delay:400ms]" />
      </div>
    </main>
  );
}
