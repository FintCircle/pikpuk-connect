import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Images,
  Info,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import automobile from "@/assets/early-automobile.jpg";
import avenue from "@/assets/fifth-avenue-1908.jpg";
import aerial from "@/assets/fifth-avenue-aerial.jpg";
import crossing from "@/assets/fifth-avenue-crossing.jpg";
import kampalaRailway from "@/assets/kampala-railway-1915.jpg";
import londonMarket from "@/assets/london-flower-market-1928.jpg";
import { ArchiveButton } from "@/components/archive-button";
import { PikPukHeader } from "@/components/pikpuk-header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type ViewerEntry = {
  readonly title: string;
  readonly place: string;
  readonly date: string;
  readonly story: readonly string[];
  readonly photos: readonly { readonly src: string; readonly alt: string; readonly caption: string; readonly credit: string }[];
};

const primaryPhoto = {
  src: avenue,
  alt: "Fifth Avenue filled with early motorcars, horse-drawn carriages, and pedestrians around 1908.",
  caption:
    "Fifth Avenue, New York, around 1908, as automobiles began appearing alongside horse-drawn traffic.",
  credit: "Representative archival image · PikPuk study collection",
};

const archiveEntries = [
  {
    title: "Fifth Avenue",
    place: "New York City",
    date: "c. 1908",
    story: [
      "At the beginning of the twentieth century, Fifth Avenue was becoming a stage for a profound change in urban life. Early automobiles moved beside horse-drawn carriages while pedestrians filled the pavements.",
      "The scene captures neither the first car nor the last carriage. Instead, it preserves the more revealing middle—the years when two eras occupied the same street.",
    ],
    photos: [
      primaryPhoto,
      {
        src: crossing,
        alt: "A busy Fifth Avenue crossing with an early open-top motorcar and horse-drawn traffic.",
        caption: "A motorcar enters the avenue while horse-drawn traffic still occupies much of the street.",
        credit: "Representative archival image · PikPuk study collection",
      },
      {
        src: automobile,
        alt: "An early automobile passing a horse-drawn carriage on Fifth Avenue.",
        caption: "The old and new share the road: an open automobile passes a horse-drawn carriage.",
        credit: "Representative archival image · PikPuk study collection",
      },
      {
        src: aerial,
        alt: "An elevated view down Fifth Avenue with pedestrians, carriages, and early automobiles.",
        caption: "From above, the avenue reveals a city in transition between horse power and the motor age.",
        credit: "Representative archival image · PikPuk study collection",
      },
    ],
  },
  {
    title: "Railway Station",
    place: "Kampala, Uganda",
    date: "c. 1915",
    story: [
      "The railway reshaped movement through inland East Africa, bringing travelers, goods, and new rhythms of work to growing towns.",
      "This representative scene preserves the station platform as a meeting place between local labor, long-distance travel, and a changing city.",
    ],
    photos: [{
      src: kampalaRailway,
      alt: "A steam train, travelers, and porters at a railway station in Kampala around 1915.",
      caption: "Travelers and porters gather beside a steam train at Kampala railway station, around 1915.",
      credit: "Representative archival image · PikPuk study collection",
    }],
  },
  {
    title: "Flower Market",
    place: "London, England",
    date: "c. 1928",
    story: [
      "Street markets made the city's daily exchange visible: growers, sellers, and customers met before the working day had fully begun.",
      "The wet pavement and handcarts place this representative scene within the ordinary commerce of interwar London.",
    ],
    photos: [{
      src: londonMarket,
      alt: "Flower sellers and shoppers at a wet London street market around 1928.",
      caption: "Flower sellers meet morning shoppers on a rain-darkened London street, around 1928.",
      credit: "Representative archival image · PikPuk study collection",
    }],
  },
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PikPuk — Historical photographs, brought closer" },
      {
        name: "description",
        content:
          "Explore historical photographs and the stories held within them on PikPuk.",
      },
      { property: "og:title", content: "PikPuk Historical Photo Archive" },
      {
        property: "og:description",
        content: "An image-first archive for exploring history one photograph at a time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mode, setMode] = useState<"photo" | "info" | "set">("photo");
  const [entryIndex, setEntryIndex] = useState(0);
  const [current, setCurrent] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const photoScale = useRef(1);
  const { profile } = useAuth();
  const [published, setPublished] = useState<ViewerEntry[]>([]);
  const entries: readonly ViewerEntry[] = [...archiveEntries, ...published];

  useEffect(() => {
    void supabase
      .from("submissions")
      .select("title,place,date_label,story,photos")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const next = (data ?? []).flatMap((row) => {
          const media = (row.photos as unknown as { publicUrl: string }[]) ?? [];
          if (!media.length) return [];
          return [{
            title: row.title,
            place: row.place ?? "",
            date: row.date_label ?? "",
            story: row.story ? row.story.split(/\n{2,}/) : [],
            photos: media.map((m) => ({
              src: m.publicUrl,
              alt: row.title,
              caption: [row.title, row.place, row.date_label].filter(Boolean).join(", "),
              credit: "Contributed to PikPuk",
            })),
          }];
        });
        setPublished(next);
      });
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("pikpuk-captions");
    if (saved !== null) setCaptionsOn(saved === "on");
  }, []);

  useEffect(() => {
    if (profile) setCaptionsOn(profile.captions_enabled);
  }, [profile]);

  const move = useCallback((direction: number) => {
    const photoCount = entries[entryIndex]?.photos.length ?? 1;
    setCurrent((index) => (index + direction + photoCount) % photoCount);
  }, [entryIndex]);

  const moveEntry = useCallback((direction: number) => {
    setEntryIndex((index) => (index + direction + entries.length) % entries.length);
    setCurrent(0);
  }, []);

  useEffect(() => {
    photoScale.current = 1;
  }, [current, mode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("photo");
      if (mode === "set" && event.key === "ArrowLeft") move(-1);
      if (mode === "set" && event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, move]);

  const entry = entries[entryIndex];
  if (!entry) return null;
  const photos = entry.photos;
  const photo = photos[current] ?? photos[0] ?? primaryPhoto;

  return (
    <main className="archive-shell">
      <PikPukHeader />

      <section className={`viewer ${mode === "info" ? "viewer-info" : ""}`}>
        <div
          className="photo-stage"
          onTouchStart={(event) => {
            if (event.touches.length !== 1 || mode === "info") {
              touchStart.current = null;
              return;
            }
            const touch = event.touches[0];
            touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start || mode === "info" || photoScale.current > 1.01) return;
            const touch = event.changedTouches[0];
            if (!touch) return;
            const deltaX = touch.clientX - start.x;
            const deltaY = touch.clientY - start.y;
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
              if (mode === "set") move(deltaX < 0 ? 1 : -1);
              else moveEntry(deltaX < 0 ? 1 : -1);
            }
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
        >
          <TransformWrapper
            key={`${entryIndex}-${current}-${mode === "set" ? "set" : "viewer"}`}
            initialScale={1}
            minScale={1}
            maxScale={5}
            centerOnInit
            centerZoomedOut
            limitToBounds
            disabled={mode === "set"}
            wheel={{ step: 0.12 }}
            doubleClick={{ mode: "zoomIn", step: 0.7 }}
            onTransform={(_ref, state) => {
              photoScale.current = state.scale;
            }}
          >
            <TransformComponent
              wrapperClass="photo-canvas"
              contentClass="photo-canvas-content"
              wrapperProps={{
                "aria-label": "Zoomable and pannable historical photograph",
              }}
            >
              <img
                className="primary-photo"
                src={photo.src}
                alt={photo.alt}
                width={1536}
                height={1024}
                draggable={false}
                aria-describedby={mode === "info" ? "full-story" : undefined}
              />
            </TransformComponent>
          </TransformWrapper>

          {mode === "photo" && (
            <ArchiveButton
              variant="square"
              className="info-square"
              onClick={() => setMode("info")}
              aria-label="Read the full historical record"
            >
              <span className="square-date">{entry.date.replace("c. ", "")}</span>
              <span className="square-place">{entry.place}</span>
              <span className="square-action">More <ArrowRight size={13} /></span>
            </ArchiveButton>
          )}

          {mode === "info" && (
            <ArchiveButton
              variant="square"
              className="photo-square"
              onClick={() => setMode("photo")}
              aria-label="Return to photograph"
            >
              <img src={photo.src} alt="" width={1536} height={1024} />
              <span>Photo <ArrowLeft size={13} /></span>
            </ArchiveButton>
          )}

          {captionsOn && mode !== "set" && (
            <div className="caption-wash">
              <p className="caption" id="photo-caption">{photo.caption}</p>
            </div>
          )}

          {mode === "photo" && (
            <ArchiveButton
              variant="icon"
              className="set-trigger"
              onClick={() => setMode("set")}
              aria-label={`Open all ${photos.length} photographs`}
              title="View photo set"
            >
              <Images size={17} strokeWidth={1.5} />
              <span>{photos.length}</span>
            </ArchiveButton>
          )}

          {mode === "set" && (
            <div className="photo-set" aria-label="Photo set">
              <div className="set-topline">
                <span>{current + 1} / {photos.length}</span>
                <ArchiveButton variant="icon" onClick={() => setMode("photo")} aria-label="Close photo set">
                  <X size={17} strokeWidth={1.5} />
                </ArchiveButton>
              </div>
              <div className="set-navigation">
                <ArchiveButton variant="icon" onClick={() => move(-1)} aria-label="Previous photograph">
                  <ArrowLeft size={18} strokeWidth={1.5} />
                </ArchiveButton>
                <ArchiveButton variant="icon" onClick={() => move(1)} aria-label="Next photograph">
                  <ArrowRight size={18} strokeWidth={1.5} />
                </ArchiveButton>
              </div>
              <div className="thumbnail-strip">
                {photos.map((item, index) => (
                  <ArchiveButton
                    key={item.src}
                    variant="thumbnail"
                    data-active={current === index}
                    onClick={() => setCurrent(index)}
                    aria-label={`View photograph ${index + 1}`}
                    aria-current={current === index ? "true" : undefined}
                  >
                    <img src={item.src} alt="" loading="lazy" width={1536} height={1024} />
                  </ArchiveButton>
                ))}
              </div>
              <p className="set-caption" aria-live="polite">{photo.caption}</p>
              <p className="set-credit">{photo.credit}</p>
            </div>
          )}
        </div>

        {mode === "info" && (
          <aside className="info-panel" aria-label="Historical record">
            <div className="info-panel-inner">
              <div className="info-kicker"><Info size={14} /> Historical record</div>
              <h1>{entry.title}</h1>
              <p className="info-deck">{entry.place} <span>·</span> {entry.date}</p>
              <div className="rule" />
              <h2>The story</h2>
              <div id="full-story" className="story-copy">
                {entry.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <dl className="record-list">
                <div><dt>Date</dt><dd>{entry.date}</dd></div>
                <div><dt>Place</dt><dd>{entry.place}</dd></div>
                <div><dt>Creator</dt><dd>Photographer unknown</dd></div>
                <div><dt>Collection</dt><dd>PikPuk study collection</dd></div>
                <div><dt>Rights</dt><dd>Representative image</dd></div>
              </dl>
              <p className="sample-note">Sample imagery and metadata for demonstration.</p>
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}