import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "PikPuk Terms" },
      { name: "description", content: "Terms for using PikPuk." },
      { property: "og:title", content: "PikPuk Terms" },
      { property: "og:description", content: "Terms for exploring and contributing to PikPuk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <ArchivePage kicker="Terms" title="Terms">
      <p>Use PikPuk respectfully and do not submit material you do not have permission to share.</p>
      <p>Full legal terms can be added before launch.</p>
    </ArchivePage>
  );
}
