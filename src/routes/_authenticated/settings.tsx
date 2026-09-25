import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { ArchivePage } from "@/components/archive-page";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "PikPuk Settings" },
      { name: "description", content: "Set captions, soundtrack, narration, and accessibility preferences on PikPuk." },
      { property: "og:title", content: "PikPuk Settings" },
      { property: "og:description", content: "Manage PikPuk experience preferences for captions, sound, narration, and motion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { profile, updateProfile } = useAuth();
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [soundtrackPreference, setSoundtrackPreference] = useState("quiet");
  const [narrationPreference, setNarrationPreference] = useState("off");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) return;
    setCaptionsEnabled(profile.captions_enabled);
    setSoundtrackPreference(profile.soundtrack_preference);
    setNarrationPreference(profile.narration_preference);
    setReducedMotion(profile.reduced_motion);
  }, [profile]);

  const save = async () => {
    setMessage("");
    await updateProfile({
      captions_enabled: captionsEnabled,
      soundtrack_preference: soundtrackPreference,
      narration_preference: narrationPreference,
      reduced_motion: reducedMotion,
    });
    window.localStorage.setItem("pikpuk-captions", captionsEnabled ? "on" : "off");
    setMessage("Settings saved.");
  };

  return (
    <ArchivePage kicker="Your PikPuk" title="Settings">
      <div className="settings-list">
        <label className="setting-row"><span>Captions</span><input type="checkbox" checked={captionsEnabled} onChange={(event) => setCaptionsEnabled(event.target.checked)} /></label>
        <label className="setting-row"><span>Soundtrack</span><select value={soundtrackPreference} onChange={(event) => setSoundtrackPreference(event.target.value)}><option value="quiet">Quiet archive</option><option value="cinematic">Cinematic</option><option value="off">Off</option></select></label>
        <label className="setting-row"><span>Audio narration</span><select value={narrationPreference} onChange={(event) => setNarrationPreference(event.target.value)}><option value="off">Off</option><option value="concise">Concise</option><option value="full">Full record</option></select></label>
        <label className="setting-row"><span>Reduced motion</span><input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} /></label>
      </div>
      <div className="page-actions"><ArchiveButton variant="plain" onClick={save}>Save settings</ArchiveButton></div>
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </ArchivePage>
  );
}
