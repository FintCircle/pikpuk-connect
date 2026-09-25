# Image-only zoom and pan

## What I’ll change
- Turn only the photograph stage below the header into the zoom-and-pan surface.
- Keep the PikPuk header fixed at its existing size and position.
- Preserve the current information, captions, and photo-set controls above the moving image.
- Support wheel/trackpad zoom, touch pinch, and drag panning with sensible zoom limits.
- Reset the image view when switching photographs or returning to the main photo view.

## Technical details
- Use a maintained zoom-and-pan library for pointer, wheel, trackpad, and touch behavior.
- Keep transformed content clipped inside the photograph stage so no scaling affects the page or header.
- Verify the interaction on desktop and mobile-sized viewports.
