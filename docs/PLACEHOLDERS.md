# Documentation Screenshots

The README references the images in this folder.

## Done

| File | Page |
|------|------|
| `cover.png` | Gemini base photo (`scripts/image-generation/villa_resort_cover_prompts.json`, variant `bale-terrace-laptop-phone`) with the homepage and a villa page composited in by `composite_screens_fit.py` (edge-fitted perspective, 4x supersampled, iOS status bar on the phone) |
| `homepage-hero.png` | `/`, hero flyover with price pins |
| `site-map.png` | `/`, the "Find your house on the terraces" site map |
| `villas.png` | `/villas` |
| `villa-page.png` | `/villas/joglo-agung` |
| `reserve.png` | `/reserve/joglo-agung?checkin=2026-11-02&checkout=2026-11-05&adults=2` |
| `mobile.png` | `/villas/joglo-agung` at 390x844 |
| `account.png` | `/account` as a signed-in guest with one upcoming trip (captured by hand) |
| `trip.png` | `/account/trips/<id>`, two hand captures stitched vertically |

## Export tips

- 1512x982 viewport at 2x device scale, then downscaled to 2000px wide (mobile: 390x844 at 2x).
- Set the sessionStorage key `lumbung:gate-seen` before loading, so the candi-bentar gate animation is skipped, and hide the Next.js dev indicator.
