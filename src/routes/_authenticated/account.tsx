import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { ArchivePage } from "@/components/archive-page";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "PikPuk Account" },
      { name: "description", content: "Manage your PikPuk email, password, contributor status, and account access." },
      { property: "og:title", content: "PikPuk Account" },
      { property: "og:description", content: "Manage functional account details for PikPuk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const { user, profile, isContributor, signOut } = useAuth();
  const deleteAccount = useServerFn(deleteMyAccount);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const changePassword = async () => {
    setMessage("");
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password updated.");
  };

  const removeAccount = async () => {
    if (!window.confirm("Delete this PikPuk account? This cannot be undone.")) return;
    setMessage("");
    setError("");
    try {
      await deleteAccount();
      await signOut();
      void navigate({ to: "/auth", search: { mode: "signin", redirect: "/" }, replace: true });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Account could not be deleted.");
    }
  };

  return (
    <ArchivePage kicker="Your PikPuk" title="Account">
      <div className="account-list">
        <div><span>Email</span><strong>{user?.email ?? "Signed in"}</strong></div>
        <div><span>Contributor status</span><strong>{isContributor ? "Contributor" : profile?.contributor_status ?? "Visitor"}</strong></div>
      </div>

      <section className="account-section" aria-label="Password">
        <h2>Password</h2>
        <label><span>Current password</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label>
        <label><span>New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" /></label>
        <ArchiveButton variant="plain" onClick={changePassword} disabled={!currentPassword || !newPassword}>Update password</ArchiveButton>
      </section>

      <section className="account-section account-danger" aria-label="Delete account">
        <h2>Account deletion</h2>
        <p>Remove your account access and saved PikPuk preferences.</p>
        <ArchiveButton variant="plain" onClick={removeAccount}>Delete account</ArchiveButton>
      </section>

      {message ? <p className="form-message" role="status">{message}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </ArchivePage>
  );
}
