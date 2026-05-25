import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  district: string | null;
  upazila: string | null;
  crops: string[];
  role: string;
};

type UserContextValue = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error: e } = await supabase
      .from("profiles")
      .select("id, name, phone, district, upazila, crops, role")
      .eq("id", uid)
      .maybeSingle();
    if (e) {
      setError("প্রোফাইল লোড করা যায়নি");
      setUser(null);
      return;
    }
    setError(null);
    setUser((data as UserProfile | null) ?? null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) { setUser(null); return; }
    await loadProfile(uid);
  }, [loadProfile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const uid = data.session?.user.id;
        if (uid && mounted) await loadProfile(uid);
      } catch {
        if (mounted) setError("সংযোগ সমস্যা, আবার চেষ্টা করুন");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}