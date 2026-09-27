import { useCallback, useEffect, useState, type FormEvent } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { uploadMedia, type UploadedMedia } from "@/lib/upload-media";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/tiff";
const MAX_FILES = 8;

type Submission = {
  id: string;
  title: string;
  place: string | null;
  date_label: string | null;
  status: string;
  photos: UploadedMedia[];
  created_at: string;
};

const statusLabel: Record<string, string> = { draft: "Draft", under_review: "Under review", published: "Published" };

export function useMySubmissions() {
  const { user } = useAuth();
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("submissions")
      .select("id,title,place,date_label,status,photos,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data ?? []).map((row) => ({ ...row, photos: (row.photos as unknown as UploadedMedia[]) ?? [] })));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, reload };
}

export function SubmissionStats({ items }: { items: Submission[] }) {
  const count = (s: string) => items.filter((i) => i.status === s).length;
  return (
    <div className="submission-stats" aria-label="Your submissions">
      <h2>Your submissions</h2>
      <p><strong>{count("published")}</strong> Published</p>
      <p><strong>{count("under_review")}</strong> Under review</p>
      <p><strong>{count("draft")}</strong> Draft</p>
    </div>
  );
}

export function SubmissionList({ items }: { items: Submission[] }) {
  if (!items.length) return <p className="submission-empty">Nothing submitted yet.</p>;
  return (
    <ul className="submission-list">
      {items.map((item) => (
        <li key={item.id}>
          {item.photos[0] ? <img src={item.photos[0].publicUrl} alt="" /> : <span className="submission-thumb-empty" />}
          <div>
            <strong>{item.title}</strong>
            <span>{[item.place, item.date_label].filter(Boolean).join(" · ")}</span>
          </div>
          <em>{statusLabel[item.status] ?? item.status}</em>
        </li>
      ))}
    </ul>
  );
}

export function SubmissionForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [story, setStory] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const submit = async (event: FormEvent, status: "draft" | "under_review") => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!user) return;
    if (!files.length) return setError("Add at least one photograph.");
    if (!title.trim()) return setError("Give your photograph a title.");

    try {
      setProgress(0);
      const uploaded: UploadedMedia[] = [];
      for (const [index, file] of files.entries()) {
        const media = await uploadMedia(file, (f) => setProgress((index + f) / files.length));
        uploaded.push(media);
      }
      const { error: insertError } = await supabase.from("submissions").insert({
        user_id: user.id,
        title: title.trim().slice(0, 160),
        place: place.trim().slice(0, 160) || null,
        date_label: dateLabel.trim().slice(0, 80) || null,
        story: story.trim().slice(0, 5000) || null,
        photos: uploaded,
        status,
      });
      if (insertError) throw insertError;
      setFiles([]);
      setTitle("");
      setPlace("");
      setDateLabel("");
      setStory("");
      setMessage(status === "draft" ? "Saved as a draft." : "Sent for review. Thank you.");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;

  return (
    <form className="account-section submission-form" onSubmit={(e) => submit(e, "under_review")}>
      <h2>Add a piece of the past</h2>
      <label>
        <span>Photographs (up to {MAX_FILES}, 25 MB each)</span>
        <input
          type="file"
          accept={ACCEPT}
          multiple
          disabled={busy}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, MAX_FILES))}
        />
      </label>
      {previews.length ? (
        <div className="submission-previews">
          {previews.map((src) => <img key={src} src={src} alt="Selected photograph preview" />)}
        </div>
      ) : null}
      <label><span>Title</span><input value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} disabled={busy} /></label>
      <label><span>Place</span><input value={place} maxLength={160} placeholder="e.g. Kampala, Uganda" onChange={(e) => setPlace(e.target.value)} disabled={busy} /></label>
      <label><span>Date</span><input value={dateLabel} maxLength={80} placeholder="e.g. c. 1950" onChange={(e) => setDateLabel(e.target.value)} disabled={busy} /></label>
      <label><span>Story or source notes</span><textarea value={story} maxLength={5000} rows={5} onChange={(e) => setStory(e.target.value)} disabled={busy} /></label>
      {busy ? <p className="form-message" role="status">Uploading… {Math.round((progress ?? 0) * 100)}%</p> : null}
      <div className="page-actions">
        <ArchiveButton type="submit" variant="plain" disabled={busy}>Send for review</ArchiveButton>
        <ArchiveButton type="button" variant="plain" disabled={busy} onClick={(e) => submit(e, "draft")}>Save draft</ArchiveButton>
      </div>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  );
}
