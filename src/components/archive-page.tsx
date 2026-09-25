import type { ReactNode } from "react";

import { PikPukHeader } from "@/components/pikpuk-header";

export function ArchivePage({ kicker, title, children }: { kicker?: string; title: string; children: ReactNode }) {
  return (
    <main className="archive-page-shell">
      <PikPukHeader />
      <section className="archive-page-body">
        {kicker ? <p className="page-kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        <div className="archive-page-content">{children}</div>
      </section>
    </main>
  );
}
