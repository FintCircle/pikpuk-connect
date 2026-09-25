import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { ArchivePage } from "@/components/archive-page";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset PikPuk Password" },
      { name: "description", content: "Set a new password for your PikPuk account." },
      { property: "og:title", content: "Reset PikPuk Password" },
      { property: "og:description", content: "Set a new password for your PikPuk account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setReady(hash.get("type") === "recovery" || Boolean(hash.get("access_token")));
  }, []);

  const submit = async () => {
    setMessage("");
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Password updated.");
    void navigate({ to: "/auth", search: { mode: "signin", redirect: "/" }, replace: true });
  };

  return (
    <ArchivePage kicker="PikPuk account" title="Reset password">
      {ready ? (
        <div className="auth-panel">
          <label><span>New password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></label>
          <ArchiveButton variant="plain" onClick={submit} disabled={!password}>Set new password</ArchiveButton>
          {message ? <p className="form-message" role="status">{message}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </div>
      ) : (
        <p>Open the password reset link from your email to set a new password.</p>
      )}
    </ArchivePage>
  );
}
