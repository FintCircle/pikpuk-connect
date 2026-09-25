import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ArchiveButton } from "@/components/archive-button";
import { ArchivePage } from "@/components/archive-page";
import { useAuth } from "@/lib/auth";

const interestOptions = ["City streets", "Family albums", "Transport", "Workplaces", "Architecture", "Everyday life"];

export const Route = createFileRoute("/_authenticated/interests")({
  head: () => ({
    meta: [
      { title: "Your PikPuk Interests" },
      { name: "description", content: "Choose the historical themes PikPuk should show you more often." },
      { property: "og:title", content: "Your PikPuk Interests" },
      { property: "og:description", content: "Personalize PikPuk with the historical subjects you care about." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Interests,
});

function Interests() {
  const { profile, updateProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSelected(profile?.interests ?? []);
  }, [profile]);

  const toggle = (interest: string) => {
    setSelected((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);
  };

  const save = async () => {
    setMessage("");
    await updateProfile({ interests: selected });
    setMessage("Interests saved.");
  };

  return (
    <ArchivePage kicker="Your PikPuk" title="Interests">
      <p>Choose the subjects that should shape future recommendations and archive paths.</p>
      <div className="preference-grid">
        {interestOptions.map((interest) => (
          <label className="preference-choice" key={interest}>
            <input type="checkbox" checked={selected.includes(interest)} onChange={() => toggle(interest)} />
            <span>{interest}</span>
          </label>
        ))}
      </div>
      <div className="page-actions">
        <ArchiveButton variant="plain" onClick={save}>Save interests</ArchiveButton>
      </div>
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </ArchivePage>
  );
}
