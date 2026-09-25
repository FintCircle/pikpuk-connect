import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PikPuk" },
      { name: "description", content: "Learn how PikPuk brings historical photographs closer." },
      { property: "og:title", content: "About PikPuk" },
      { property: "og:description", content: "PikPuk is an image-first space for exploring historical photographs and their stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <ArchivePage kicker="About" title="Historical photographs, brought closer">
      <p>PikPuk is a quiet archive viewer for slowing down with images, context, and the human details that survive inside a photograph.</p>
      <p>The first version focuses on careful viewing: a large photograph, concise records, and account spaces for future personalization and contribution.</p>
    </ArchivePage>
  );
}
