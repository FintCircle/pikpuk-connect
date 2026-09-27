import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";
import { SubmissionList, SubmissionStats, useMySubmissions } from "@/components/submission-form";

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
  const { items, loading } = useMySubmissions();
  return (
    <ArchivePage kicker="Contribute" title="Your submissions">
      {loading ? <p>Loading…</p> : (
        <div className="submission-panel">
          <SubmissionStats items={items} />
          <SubmissionList items={items} />
        </div>
      )}
    </ArchivePage>
  );
}
