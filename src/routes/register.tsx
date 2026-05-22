import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sprout, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { DISTRICTS, CROPS } from "@/lib/bd-data";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "নিবন্ধন — কৃষিবন্ধু" }] }),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [crops, setCrops] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
    });
  }, [navigate]);

  const toggleCrop = (c: string) =>
    setCrops((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !district || !upazila || crops.length === 0) {
      return toast.error("সব তথ্য পূরণ করুন");
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate({ to: "/login" });
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, name, district, upazila, crops,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("স্বাগতম, " + name);
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-6 pt-10 pb-6" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-2 ring-white/20">
          <Sprout className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">নিবন্ধন করুন</h1>
          <p className="text-sm text-white/85">আপনার তথ্য দিন</p>
        </div>
      </header>

      <form onSubmit={submit} className="px-6 py-6 space-y-5 max-w-md mx-auto">
        <div>
          <Label htmlFor="name" className="text-base font-semibold">আপনার নাম</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)}
            className="h-13 text-base mt-1.5" placeholder="পূর্ণ নাম লিখুন" />
        </div>

        <div>
          <Label className="text-base font-semibold">জেলা</Label>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="h-13 text-base mt-1.5"><SelectValue placeholder="জেলা নির্বাচন করুন" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {DISTRICTS.map((d) => <SelectItem key={d} value={d} className="text-base">{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="upz" className="text-base font-semibold">উপজেলা</Label>
          <Input id="upz" required value={upazila} onChange={(e) => setUpazila(e.target.value)}
            className="h-13 text-base mt-1.5" placeholder="উপজেলার নাম" />
        </div>

        <div>
          <Label className="text-base font-semibold mb-2 block">আপনার ফসল</Label>
          <div className="grid grid-cols-3 gap-2">
            {CROPS.map((c) => {
              const active = crops.includes(c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleCrop(c)}
                  className={`relative h-14 rounded-xl border-2 text-base font-semibold transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {c}
                  {active && <Check className="absolute top-1 right-1 h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full h-14 text-base font-bold mt-4">
          {saving ? "সংরক্ষণ হচ্ছে..." : "নিবন্ধন করুন"}
        </Button>
      </form>
    </main>
  );
}