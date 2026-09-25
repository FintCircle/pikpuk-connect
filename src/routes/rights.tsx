import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/rights")({
  head: () => ({
    meta: [
      { title: "PikPuk Rights" },
      { name: "description", content: "Rights information for photographs and records on PikPuk." },
      { property: "og:title", content: "PikPuk Rights" },
      { property: "og:description", content: "Rights and reuse information for PikPuk photographs and archive records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rights,
});

function Rights() {
  return (
    <ArchivePage kicker="Rights" title="Rights">
      <p>Each photograph should carry its own source and rights note. Reuse depends on that specific record.</p>
      <p>The sample images in this prototype are representative placeholders.</p>
    </ArchivePage>
  );
}
