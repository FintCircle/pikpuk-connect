import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

type ProfileRow = Tables<"profiles">;
const authRedirects = ["/", "/interests", "/settings", "/account", "/contribute", "/submissions"] as const;

type ProfileUpdate = Pick<
  TablesUpdate<"profiles">,
  "display_name" | "interests" | "captions_enabled" | "soundtrack_preference" | "narration_preference" | "reduced_motion"
>;

export type PikPukProfile = Omit<ProfileRow, "interests"> & {
  interests: string[];
};

type AuthContextValue = {
  user: User | null;
  profile: PikPukProfile | null;
  isContributor: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: ProfileUpdate) => Promise<PikPukProfile>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toInterestList(value: ProfileRow["interests"]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeProfile(profile: ProfileRow): PikPukProfile {
  return {
    ...profile,
    interests: toInterestList(profile.interests),
  };
}

function getDisplayName(user: User) {
  const metadata = user.user_metadata;
  const name = metadata?.["name"] ?? metadata?.["full_name"];
  return typeof name === "string" && name.trim() ? name : null;
}

function consumeAuthRedirect() {
  const stored = window.sessionStorage.getItem("pikpuk-auth-redirect");
  window.sessionStorage.removeItem("pikpuk-auth-redirect");
  if (!stored || !authRedirects.includes(stored as (typeof authRedirects)[number])) return;
  if (window.location.pathname !== stored) window.location.assign(stored);
}

async function ensureProfile(user: User): Promise<PikPukProfile> {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return normalizeProfile(existing);

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      display_name: getDisplayName(user),
    })
    .select("*")
    .single();

  if (insertError) {
    const { data: afterRace, error: raceError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (raceError) throw raceError;
    if (afterRace) return normalizeProfile(afterRace);
    throw insertError;
  }

  return normalizeProfile(created);
}

export function AuthProvider({ children, queryClient }: { children: ReactNode; queryClient: QueryClient }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PikPukProfile | null>(null);
  const [isContributor, setIsContributor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileForUser = useCallback(async (nextUser: User) => {
    const nextProfile = await ensureProfile(nextUser);
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", nextUser.id);

    if (rolesError) throw rolesError;

    setProfile(nextProfile);
    setIsContributor(
      nextProfile.contributor_status === "contributor" ||
        (roles ?? []).some((role) => role.role === "contributor"),
    );
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setUser(null);
      setProfile(null);
      setIsContributor(false);
      return;
    }

    setUser(data.user);
    await loadProfileForUser(data.user);
  }, [loadProfileForUser]);

  const updateProfile = useCallback(
    async (patch: ProfileUpdate) => {
      if (!user) throw new Error("Sign in to update your PikPuk settings.");
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select("*")
        .single();

      if (error) throw error;
      const nextProfile = normalizeProfile(data);
      setProfile(nextProfile);
      return nextProfile;
    },
    [user],
  );

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsContributor(false);
  }, [queryClient]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || !data.user) {
          setUser(null);
          setProfile(null);
          setIsContributor(false);
          return;
        }
        setUser(data.user);
        await loadProfileForUser(data.user);
        if (active) consumeAuthRedirect();
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setIsContributor(false);
        queryClient.clear();
      } else {
        void queryClient.invalidateQueries();
        window.setTimeout(() => {
          void loadProfileForUser(nextUser)
            .then(consumeAuthRedirect)
            .catch(() => undefined);
        }, 0);
      }
      void router.invalidate();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfileForUser, queryClient, router]);

  const value = useMemo(
    () => ({ user, profile, isContributor, isLoading, refreshProfile, updateProfile, signOut }),
    [user, profile, isContributor, isLoading, refreshProfile, updateProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
