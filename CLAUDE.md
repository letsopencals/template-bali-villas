# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs). The section for this template (Bali Villa Rentals, demo brand Lumbung Sidemen) is at the end.

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getVillas`, `getVilla`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/villas/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/home/`, `components/villas/`,
  `components/villa/`, `components/reserve/`, `components/account/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/trip-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx`: `<Button variant size fullWidth pill onDark>`. Variants:
  `primary` (terracotta), `secondary` (jungle), `outline`, `ghost`, `glass`
  (only over photos and video). Sizes `sm|md|lg`. **Lumbung buttons are pills**
  (`rounded-full`), which is the canonical shape. Links that should look like
  buttons use `buttonClasses(variant, size, { fullWidth, pill, onDark, className })`. Pass
  only layout classes via `className`.
- `components/ui/input.tsx`: `<Input>`, `<Textarea>`, `<Select>`, `<Field>`.
- Selection chips use `components/ui/chip.tsx`, counters use `stepper.tsx`.
- Leave genuinely-different controls inline: selection/toggle chips with an
  active/selected state (staff/time/day/variant/location/department pickers, step
  indicator/progress, pagination), destructive buttons (no destructive variant),
  `<select>`, checkboxes/radios, icon-only controls, and navigation rendered as
  `next/link` `<Link>` (Button renders a `<button>` and has no anchor mode).

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
booking flow / cart context). A large hook may remain as a thin orchestrator that
composes the smaller ones (`hooks/use-stay-booking.ts`).

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `location`, `timezone`, `cart`) follow this.
- Hoist static objects (framer-motion `initial`/`animate`/`transition`, default
  non-primitive props) to module-level `const`s instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. calendar day cells).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe must be loaded
  this way on `/reserve/[slug]` (`ssr: false`) so it isn't in the initial bundle.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use. `components/motifs/index.ts` and `components/stay/index.ts`
  exist for convenience, but importing the file directly is preferred.

## Bali Villa Rentals (demo brand Lumbung Sidemen): 10 villas in Sidemen, Bali (USD, nightly stays)

### Contract files (read-only for everyone except the lead)
`DESIGN.md`, `lib/site-config.ts`, `lib/villa-content.ts`, `lib/stay.ts` and
`media/manifest.json`. Don't edit them. Raise changes as `TODO(lead)` in your
report. `public/images`, `public/videos`, `public/logo.svg` and `app/icon.svg`
belong to the media pipeline.

### Ownership
Who builds what is in **DESIGN.md §8**. In short:
- **Foundation [C]** owns `components/ui/*`, `components/stay/*`,
  `components/motifs/*`, `components/motion/*`, `components/layout/*`,
  `components/villas/villa-card.tsx`, `app/globals.css`, `app/layout.tsx`,
  `app/template.tsx`, `lib/server-data.ts`, `lib/villa-images.ts`,
  `lib/contact.ts`, the `/api/*` routes and the hooks.
- **Page agents** own their route folders and `components/home|villas|villa|reserve|account|marketing/*`.
Each stub page carries a `TODO(Cn)` comment naming its owner.

### Stay model
Each villa is one product with a one-night base duration (86400 s),
`allowCustomDuration`, no staff, and `fixedTimes` (check-in 15:00, check-out
11:00) on a continuous schedule. N nights = N base units = N x the nightly price.
`cancelGap` is 14 days. All dates are local `YYYY-MM-DD` in `siteConfig.timezone`
(`Asia/Makassar`, UTC+8), never the browser's timezone.
- **Turnover:** a check-out day may be another guest's check-in day (11:00 out,
  15:00 in). `lib/stay.ts` models a night as check-in time on day D to check-out
  time on D+1, so a booked night only blocks that night.
- **Data:** `getVillas()` / `getVilla(slug)` / `getVillasIn(collection)` in
  `server-data.ts` merge API products (title, price, photos, limits) with
  `villaContent[slug]` (rooms, story, amenities). Pick photos by name with
  `lib/villa-images.ts` (`resolveImage`, `roomImages`, `dayDuskImages`,
  `orderedGallery`), never by index.
- **Availability:** `hooks/use-villa-ranges.ts` calls
  `/api/villas/[slug]/ranges` and returns merged UTC ranges. Check them on the
  client with `isNightAvailable`, `fitsStay`, `latestCheckout` and
  `firstFreeStay`. The server re-validates when the stay is booked.
- **Booking:** `hooks/use-stay-booking.ts` sends local dates to
  `/api/reserve`. The route builds the UTC slot with `toStaySlot` and the
  villa's own `stayTimesFor(product)`. Clients never build slots.
- Guests (adults/children/infants), arrival time, flight number and occasion
  are **not** part of the slot. They travel as appointment `customAttributes`
  (keys in `siteConfig.customAttributeKeys`), sanitised by
  `lib/reserve-attributes.ts`. Use `guestsToAttributes` from `lib/guests.ts`.
- Checkout submits with `appointmentsSettings.markAsScheduled: true`, then goes
  to `/reserve/confirmed/{orderId}`.

### Design
- Fonts come from next/font in the layout: Fraunces with the `opsz`, `SOFT`
  and `WONK` axes (`.display-*`, `.italic-soft`) and Figtree for body text.
  Use `.tabular` for prices, dates and countdowns. All tokens are in
  `globals.css` and listed in DESIGN.md §2–§5.
- Paper and jungle surfaces, with terracotta as the only accent. Cards are
  rounded 24px, images 20px, buttons and chips are pills, and villa portraits
  use the `.arch` frame. `.glass` is only for content over photos or video.
- **Images:** every image sits inside an `.image-placeholder` container and
  renders through `SafeImage`. Villa photos come from the store. Editorial art
  is in `public/images/` (`templateImage(path)`).
- **Motifs:** `CandiBentar` (gate on the home hero, curtain in
  `app/template.tsx`, divider), `TerraceLines`, `IkatRule`, `CanangSari`
  (loading), `LumbungMark`. The gate is hidden before paint for returning
  visitors (`GateScript` sets `html[data-gate-seen]` from sessionStorage) and
  under reduced motion. Mark content that rises with the gate `data-gate-rise`.
- **Motion:** use `components/motion/*`. Every component has a reduced-motion
  fallback. Import `useReducedMotion` from
  `@/components/motion/use-reduced-motion`, not framer-motion. Lenis owns
  scrolling, so scrollable overlays need `data-lenis-prevent` (Sheet, Dialog and
  MenuOverlay already set it and lock scrolling via `useModalOverlay`).
- **Pickers:** `DateGuestField` opens a `Sheet` on coarse pointers and a
  `FloatingPanel` on fine pointers (`useMediaQuery(COARSE_POINTER)`). It doesn't
  use native date inputs, because they can't show unavailable nights. Mark extra
  triggers with `data-panel-for={id}`. Don't put `hidden` on
  `buttonClasses`/`Button`: there's no tailwind-merge, so the base
  `inline-flex` wins. Use `max-sm:hidden`.
- **Header:** transparent with cream text on `TRANSPARENT_HEADER_ROUTES` in
  `components/layout/header.tsx` (`/`, `/experiences`, `/about`,
  `/getting-there`). Those pages must start with a full-bleed dark hero.
- **Z-index:** menu overlay z-55, header z-60, ScrollProgress z-60,
  FloatingPanel z-62, Sheet/Dialog scrim z-65 and panel z-66, candi bentar
  gate and curtain z-70.

### Gotchas
- Next page and route files can only export Next's own names. Put helpers in `lib/`.
- Server code can't call functions exported from a `'use client'` file ("Attempted to call X() from the server"). Pure helpers live in `lib/` (`lib/guests.ts`, `lib/format.ts`); a client component may re-export them, but server modules import from `lib/`.
- Hero pins (`siteConfig.heroPins`/`heroPinsMobile`) are generated by `scripts/image-generation/track_villa_resort_hero_pins.py`. Re-run it when a hero video changes; don't hand-edit them.
- Next 15 route `params` and `searchParams` are Promises.
- The SDK runs with `throwOnError: true` (`lib/opencals.ts`). Catch
  `OpencalsApiError` in routes and pass it through `handleApiError`.
- Quote cancellation and change-date cutoffs with `lastFreeDay` from
  `components/account/trip-policy.ts` (villa page, checkout and trip page all
  use it). It returns the day before the backend's exact cutoff, so the copy and
  the buttons always agree.
- In shell commands, quote bracketed paths (`'app/villas/[slug]/page.tsx'`).

## Verifying changes

- `npm run typecheck` (`tsc --noEmit`), `npx eslint .` and `npm test` (vitest:
  `lib/stay.test.ts`, `lib/helpers.test.ts`) must pass.
- `npm run build` must pass before release. In the route summary, read-only
  pages should be `○` (static) or `ƒ` (dynamic) Server Components, not pure
  client pages. While several agents work in this folder, only the lead runs
  `next build` / `next dev`.
- Smoke test: `/` and `/villas` return 200, a villa's ranges route returns
  merged ranges, and a 3-night stay books 15:00 → 11:00 local (07:00Z → 03:00Z)
  with its guest attributes.
