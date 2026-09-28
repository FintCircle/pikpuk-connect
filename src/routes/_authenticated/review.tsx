import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { ArchivePage } from "@/components/archive-page";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/review")({
  head: () => ({
    meta: [
      { title: "Review Submissions · PikPuk" },
      { name: "description", content: "Approve contributed photographs for the PikPuk archive." },
      { property: "og:title", content: "Review Submissions · PikPuk" },
      { property: "og:description", content: "Reviewer desk for PikPuk contributions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Review,
});

type Row = { id: string; title: string; place: string | null; date_label: string | null; story: string | null; photos: { publicUrl: string }[]; status: string };

function Review() {
  const { isAdmin, isLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("submissions")
      .select("id,title,place,date_label,story,photos,status")
      .in("status", ["under_review", "published"])
      .order("created_at", { ascending: false });
    setRows((data ?? []).map((r) => ({ ...r, photos: (r.photos as unknown as Row["photos"]) ?? [] })));
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  const setStatus = async (id: string, status: "published" | "draft") => {
    setError("");
    const { error: e } = await supabase.from("submissions").update({ status }).eq("id", id);
    if (e) setError(e.message);
    else void load();
  };

  if (isLoading) return <ArchivePage kicker="Review" title="Review submissions"><p>Loading…</p></ArchivePage>;
  if (!isAdmin) return <ArchivePage kicker="Review" title="Review submissions"><p>Only PikPuk reviewers can open this page.</p></ArchivePage>;

  const pending = rows.filter((r) => r.status === "under_review");
  const live = rows.filter((r) => r.status === "published");

  const card = (r: Row) => (
    <article key={r.id} className="review-card">
      <div className="submission-previews">
        {r.photos.map((p) => <img key={p.publicUrl} src={p.publicUrl} alt={r.title} />)}
      </div>
      <h3>{r.title}</h3>
      <p className="review-meta">{[r.place, r.date_label].filter(Boolean).join(" · ")}</p>
      {r.story ? <p>{r.story}</p> : null}
      <div className="page-actions">
        {r.status === "under_review" ? (
          <>
            <ArchiveButton variant="plain" onClick={() => setStatus(r.id, "published")}>Publish</ArchiveButton>
            <ArchiveButton variant="plain" onClick={() => setStatus(r.id, "draft")}>Send back</ArchiveButton>
          </>
        ) : (
          <ArchiveButton variant="plain" onClick={() => setStatus(r.id, "draft")}>Unpublish</ArchiveButton>
        )}
      </div>
    </article>
  );

  return (
    <ArchivePage kicker="Review" title="Review submissions">
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <section className="account-section">
        <h2>Waiting for review ({pending.length})</h2>
        {pending.length ? pending.map(card) : <p className="submission-empty">Nothing waiting.</p>}
      </section>
      <section className="account-section">
        <h2>Published ({live.length})</h2>
        {live.length ? live.map(card) : <p className="submission-empty">Nothing published yet.</p>}
      </section>
    </ArchivePage>
  );
}
