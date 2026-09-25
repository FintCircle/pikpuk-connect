import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "PikPuk Privacy" },
      { name: "description", content: "Privacy notes for PikPuk accounts and preferences." },
      { property: "og:title", content: "PikPuk Privacy" },
      { property: "og:description", content: "How PikPuk treats account details, interests, settings, and contribution information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <ArchivePage kicker="Privacy" title="Privacy">
      <p>PikPuk stores account details and preferences only to support sign-in, personalization, accessibility settings, and contribution workflows.</p>
      <p>Full legal policy text can be added before launch.</p>
    </ArchivePage>
  );
}
