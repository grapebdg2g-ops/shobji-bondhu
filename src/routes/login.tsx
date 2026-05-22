import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout, Mail, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "প্রবেশ করুন — কৃষিবন্ধু" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const afterLogin = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    const { data: p } = await supabase
      .from("profiles").select("district").eq("id", data.session.user.id).maybeSingle();
    navigate({ to: p?.district ? "/dashboard" : "/register" });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Google সাইন-ইন ব্যর্থ"); setLoading(false); return; }
    if (r.redirected) return;
    await afterLogin();
    setLoading(false);
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error?.message.toLowerCase().includes("invalid")) {
      const r = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin },
      });
      error = r.error;
      if (!error) toast.success("অ্যাকাউন্ট তৈরি হয়েছে");
    }
    if (error) { toast.error(error.message); setLoading(false); return; }
    await afterLogin();
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phone) return toast.error("ফোন নম্বর দিন");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) return toast.error(error.message);
    setOtpSent(true);
    toast.success("OTP পাঠানো হয়েছে");
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    setLoading(false);
    if (error) return toast.error(error.message);
    await afterLogin();
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="flex flex-col items-center gap-3 px-6 pt-12 pb-8" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25">
          <Sprout className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">কৃষিবন্ধু</h1>
        <p className="text-sm text-white/85">প্রবেশ করুন আপনার অ্যাকাউন্টে</p>
      </header>

      <div className="flex-1 px-6 py-6 -mt-4">
        <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-card)]">
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 text-base font-semibold gap-3 border-2"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google দিয়ে প্রবেশ করুন
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">অথবা</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="email">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="email" className="text-base gap-2"><Mail className="h-4 w-4" />ইমেইল</TabsTrigger>
              <TabsTrigger value="phone" className="text-base gap-2"><Phone className="h-4 w-4" />ফোন</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <form onSubmit={handleEmail} className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-base">ইমেইল</Label>
                  <Input id="email" type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base mt-1" placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="pwd" className="text-base">পাসওয়ার্ড</Label>
                  <Input id="pwd" type="password" required minLength={6} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 text-base mt-1" placeholder="••••••" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 text-base font-bold gap-2">
                  প্রবেশ করুন <ChevronRight className="h-5 w-5" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone" className="text-base">ফোন নম্বর</Label>
                  <Input id="phone" type="tel" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-base mt-1" placeholder="+8801XXXXXXXXX" />
                </div>
                {otpSent && (
                  <div>
                    <Label htmlFor="otp" className="text-base">OTP কোড</Label>
                    <Input id="otp" inputMode="numeric" value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-12 text-base mt-1 tracking-widest text-center" placeholder="123456" />
                  </div>
                )}
                <Button
                  type="button"
                  disabled={loading}
                  className="w-full h-14 text-base font-bold gap-2"
                  onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                >
                  {otpSent ? "যাচাই করুন" : "OTP পাঠান"} <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          প্রবেশ করার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন
        </p>
      </div>
    </main>
  );
}