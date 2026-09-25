import { createFileRoute } from "@tanstack/react-router";

import { ArchivePage } from "@/components/archive-page";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact PikPuk" },
      { name: "description", content: "Contact PikPuk about archive records, rights, or contributions." },
      { property: "og:title", content: "Contact PikPuk" },
      { property: "og:description", content: "Reach PikPuk about photographs, records, rights, or contribution questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <ArchivePage kicker="Contact" title="Send a note">
      <p>For this prototype, contact details are not connected yet. Add the preferred email address or contact method when PikPuk is ready to receive messages.</p>
    </ArchivePage>
  );
}
