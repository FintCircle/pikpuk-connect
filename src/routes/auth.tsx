import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { ArchivePage } from "@/components/archive-page";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type AuthMode = "signin" | "signup";
const allowedRedirects = ["/", "/review", "/interests", "/settings", "/account", "/contribute", "/submissions"] as const;
type AllowedRedirect = (typeof allowedRedirects)[number];

function cleanRedirect(value: unknown): AllowedRedirect {
  return typeof value === "string" && allowedRedirects.includes(value as AllowedRedirect) ? (value as AllowedRedirect) : "/";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: AuthMode; redirect: AllowedRedirect } => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
    redirect: cleanRedirect(search["redirect"]),
  }),
  head: () => ({
    meta: [
      { title: "Sign in to PikPuk" },
      { name: "description", content: "Sign in or create a PikPuk account." },
      { property: "og:title", content: "Sign in to PikPuk" },
      { property: "og:description", content: "Access your PikPuk interests, settings, account, and contributions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [mode, setMode] = useState<AuthMode>(search.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const title = mode === "signup" ? "Create account" : "Sign in";
  const redirect = useMemo(() => cleanRedirect(search.redirect), [search.redirect]);

  useEffect(() => {
    setMode(search.mode);
  }, [search.mode]);

  useEffect(() => {
    if (user) void navigate({ to: redirect });
  }, [navigate, redirect, user]);

  const submit = async () => {
    setMessage("");
    setError("");
    if (mode === "signup") {
      const confirmationUrl = new URL("/auth", window.location.origin);
      confirmationUrl.searchParams.set("redirect", redirect);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: confirmationUrl.toString() },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setMessage("Check your email to confirm your PikPuk account.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    await refreshProfile();
    void navigate({ to: redirect });
  };

  const googleSignIn = async () => {
    setError("");
    window.sessionStorage.setItem("pikpuk-auth-redirect", redirect);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message);
    if (!result.redirected && !result.error) {
      await refreshProfile();
      void navigate({ to: redirect });
    }
  };

  const recover = async () => {
    setMessage("");
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("Password reset email sent.");
  };

  return (
    <ArchivePage kicker="PikPuk account" title={title}>
      <div className="auth-panel">
        <ArchiveButton variant="plain" onClick={googleSignIn}>Continue with Google</ArchiveButton>
        <div className="auth-divider"><span>or</span></div>
        <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
        <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
        <ArchiveButton variant="plain" onClick={submit} disabled={!email || !password}>{title}</ArchiveButton>
        {mode === "signin" ? <ArchiveButton variant="menu" className="auth-text-button" onClick={recover} disabled={!email}>Forgot password?</ArchiveButton> : null}
        <ArchiveButton variant="menu" className="auth-text-button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Create account" : "Sign in instead"}
        </ArchiveButton>
        {message ? <p className="form-message" role="status">{message}</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div>
    </ArchivePage>
  );
}
