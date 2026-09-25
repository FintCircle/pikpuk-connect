import { createFileRoute } from "@tanstack/react-router";

import { ArchiveButton } from "@/components/archive-button";
import { ArchivePage } from "@/components/archive-page";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute to PikPuk" },
      { name: "description", content: "Contribute photographs, memories, and source notes to PikPuk." },
      { property: "og:title", content: "Contribute to PikPuk" },
      { property: "og:description", content: "Share a piece of the past with PikPuk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contribute,
});

function Contribute() {
  const { user, isContributor, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ArchivePage kicker="Contribute" title="Preparing the contribution desk">
        <p>Checking account access.</p>
      </ArchivePage>
    );
  }

  if (!user) {
    return (
      <ArchivePage kicker="Contribute" title="Add a piece of the past">
        <p>Share a photograph, memory, location detail, or source note. Create an account so your contribution can be saved, reviewed, and connected to you.</p>
        <div className="page-actions">
          <ArchiveButton asChild variant="plain"><a href="/auth?redirect=/contribute">Sign in</a></ArchiveButton>
          <ArchiveButton asChild variant="plain"><a href="/auth?mode=signup&redirect=/contribute">Create account</a></ArchiveButton>
        </div>
      </ArchivePage>
    );
  }

  return (
    <ArchivePage kicker="Contribute" title="Add a piece of the past">
      <div className="submission-panel">
        <ArchiveButton variant="plain">+ Add a piece of the past</ArchiveButton>
        {isContributor ? (
          <div className="submission-stats" aria-label="Your submissions">
            <h2>Your submissions</h2>
            <p><strong>3</strong> Published</p>
            <p><strong>1</strong> Under review</p>
            <p><strong>1</strong> Draft</p>
          </div>
        ) : (
          <p>Your account is ready for contribution requests. Contributor review tools will be connected in the next publishing workflow.</p>
        )}
      </div>
    </ArchivePage>
  );
}
