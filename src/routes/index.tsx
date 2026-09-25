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
import { ArchiveButton } from "@/components/archive-button";
import { PikPukHeader } from "@/components/pikpuk-header";
import { useAuth } from "@/lib/auth";

const primaryPhoto = {
  src: avenue,
  alt: "Fifth Avenue filled with early motorcars, horse-drawn carriages, and pedestrians around 1908.",
  caption:
    "Fifth Avenue, New York, around 1908, as automobiles began appearing alongside horse-drawn traffic.",
  credit: "Representative archival image · PikPuk study collection",
};

const photos = [
  primaryPhoto,
  {
    src: crossing,
    alt: "A busy Fifth Avenue crossing with an early open-top motorcar and horse-drawn traffic.",
    caption:
      "A motorcar enters the avenue while horse-drawn traffic still occupies much of the street.",
    credit: "Representative archival image · PikPuk study collection",
  },
  {
    src: automobile,
    alt: "An early automobile passing a horse-drawn carriage on Fifth Avenue.",
    caption:
      "The old and new share the road: an open automobile passes a horse-drawn carriage.",
    credit: "Representative archival image · PikPuk study collection",
  },
  {
    src: aerial,
    alt: "An elevated view down Fifth Avenue with pedestrians, carriages, and early automobiles.",
    caption:
      "From above, the avenue reveals a city in transition between horse power and the motor age.",
    credit: "Representative archival image · PikPuk study collection",
  },
];

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
  const [current, setCurrent] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const touchStart = useRef<number | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const saved = window.localStorage.getItem("pikpuk-captions");
    if (saved !== null) setCaptionsOn(saved === "on");
  }, []);

  useEffect(() => {
    if (profile) setCaptionsOn(profile.captions_enabled);
  }, [profile]);

  const move = useCallback((direction: number) => {
    setCurrent((index) => (index + direction + photos.length) % photos.length);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("photo");
      if (mode === "set" && event.key === "ArrowLeft") move(-1);
      if (mode === "set" && event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, move]);

  const photo = photos[current] ?? primaryPhoto;

  return (
    <main className="archive-shell">
      <PikPukHeader />

      <section className={`viewer ${mode === "info" ? "viewer-info" : ""}`}>
        <div
          className="photo-stage"
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (mode !== "set" || touchStart.current === null) return;
            const end = event.changedTouches[0]?.clientX ?? touchStart.current;
            if (Math.abs(end - touchStart.current) > 45) move(end < touchStart.current ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <TransformWrapper
            key={`${current}-${mode === "set" ? "set" : "viewer"}`}
            initialScale={1}
            minScale={1}
            maxScale={5}
            centerOnInit
            centerZoomedOut
            limitToBounds
            disabled={mode === "set"}
            wheel={{ step: 0.12 }}
            doubleClick={{ mode: "zoomIn", step: 0.7 }}
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
              <span className="square-date">1908</span>
              <span className="square-place">New York City</span>
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
              <img src={avenue} alt="" width={1536} height={1024} />
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
              <h1>Fifth Avenue</h1>
              <p className="info-deck">New York City <span>·</span> c. 1908</p>
              <div className="rule" />
              <h2>The story</h2>
              <div id="full-story" className="story-copy">
                <p>At the beginning of the twentieth century, Fifth Avenue was becoming a stage for a profound change in urban life. Early automobiles moved beside horse-drawn carriages while pedestrians filled the pavements.</p>
                <p>The scene captures neither the first car nor the last carriage. Instead, it preserves the more revealing middle—the years when two eras occupied the same street.</p>
              </div>
              <dl className="record-list">
                <div><dt>Date</dt><dd>c. 1908</dd></div>
                <div><dt>Place</dt><dd>Fifth Avenue, New York</dd></div>
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