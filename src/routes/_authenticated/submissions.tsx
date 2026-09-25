import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({
    meta: [
      { title: "Your PikPuk Submissions" },
      { name: "description", content: "Review your PikPuk contribution submissions." },
      { property: "og:title", content: "Your PikPuk Submissions" },
      { property: "og:description", content: "Contributor submission status on PikPuk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Submissions,
});

function Submissions() {
  return (
    <ArchivePage kicker="Contribute" title="Your submissions">
      <div className="submission-stats standalone">
        <p><strong>3</strong> Published</p>
        <p><strong>1</strong> Under review</p>
        <p><strong>1</strong> Draft</p>
      </div>
    </ArchivePage>
  );
}
