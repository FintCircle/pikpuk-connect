import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "PikPuk Help" },
      { name: "description", content: "Get help using PikPuk's historical photo viewer." },
      { property: "og:title", content: "PikPuk Help" },
      { property: "og:description", content: "Help for exploring photographs, captions, records, and contributions on PikPuk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Help,
});

function Help() {
  return (
    <ArchivePage kicker="Help" title="Using PikPuk">
      <p>Open a photograph to explore its caption, record, and related images. The menu stays separate from the viewing area so the photograph remains the focus.</p>
      <p>If something looks wrong or a record needs more context, use Contact or the contributor guidelines to share what you know.</p>
    </ArchivePage>
  );
}
