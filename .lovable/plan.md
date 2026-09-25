# PikPuk historical photo viewer

## What I’ll build
- Replace the blank page with an immersive, single-photo archive viewer branded **PikPuk**.
- Keep the photograph dominant, with a short caption, discreet caption toggle, and separate controls for historical information and the photo set.
- Add a smoothly expanding information experience: a 60/40 photo-and-story layout on desktop and an accessible mobile sheet.
- Add a four-photo set with count, thumbnails, previous/next controls, keyboard navigation, and mobile swipe gestures.
- Use representative archival imagery for the prototype and clearly label its sample metadata.

## Visual direction
- Quiet editorial archive: warm paper, ink black, aged silver photography, restrained serif headlines, and compact archival labels.
- Generous spacing, square controls, fine rules, minimal shadows, and subtle transitions that never obscure the photograph.
- No social feed patterns, ornamental cards, or persistent image darkening.

## Technical details
- Build the interactive experience in the home route with React state and semantic controls.
- Store the caption preference locally after the page loads, avoiding server-rendering mismatches.
- Define all palette, typography, motion, and surface values as semantic design tokens in the global stylesheet.
- Add route-specific title, description, Open Graph, and Twitter metadata.
- Verify the core flow at desktop and mobile sizes, including information mode, photo-set navigation, and caption preference.

## Scope note
- This pass delivers the complete public viewing prototype. The admin image-ingestion workflow and persistent archive database require a separate Cloud-backed implementation.
