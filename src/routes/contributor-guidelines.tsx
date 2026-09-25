import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/contributor-guidelines")({
  head: () => ({
    meta: [
      { title: "PikPuk Contributor Guidelines" },
      { name: "description", content: "Guidelines for contributing historical photographs and context to PikPuk." },
      { property: "og:title", content: "PikPuk Contributor Guidelines" },
      { property: "og:description", content: "How contributors can share photographs, memories, and source notes with PikPuk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Guidelines,
});

function Guidelines() {
  return (
    <ArchivePage kicker="Contributors" title="Handle the past with care">
      <p>Contributions should include what is known, what is uncertain, and where the information came from.</p>
      <p>Photographs involving private families, sensitive places, or living people should be described with restraint and respect.</p>
    </ArchivePage>
  );
}
