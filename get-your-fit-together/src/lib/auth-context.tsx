"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Ensure profile exists/updated on every sign-in
      if (event === "SIGNED_IN" && session?.user) {
        await createProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to create or update profile with best-effort full_name
async function createProfile(user: User) {
  try {
    const provider = (user.app_metadata as any)?.provider as string | undefined;
    const meta = user.user_metadata as any;

    // Prefer provider full_name; fallback to signup-provided full_name; finally fallback to email local-part
    const derivedFullName =
      meta?.full_name ||
      meta?.name ||
      (typeof user.email === "string" ? user.email.split("@")[0] : null);

    console.log("Creating/updating profile for user:", {
      id: user.id,
      email: user.email,
      provider,
      user_metadata: meta,
      derivedFullName,
    });

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: derivedFullName ?? null,
        avatar_url: meta?.avatar_url || meta?.picture || null,
      })
      .select("id, full_name")
      .single();

    if (error) {
      console.error("Error upserting profile:", error);
    } else {
      console.log("Profile upserted successfully");
    }
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}
