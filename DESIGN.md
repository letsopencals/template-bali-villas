# Lumbung Sidemen: design bible

> *Ten houses in the rice fields.*
> A family-run resort of ten villas on the terraces of the Sidemen valley, East Bali, with Mount Agung across the valley.

This file is a **contract**. Every agent building this template reads it. Only the lead edits it. If you need something that isn't here, add a `TODO(lead):` note in your summary rather than inventing a parallel system.

---

## 1. Voice

- **Warm, honest, quietly luxurious.** The voice of a host who knows every path in the valley, not a hotel chain.
- **Show every price.** Nightly rates on every card, the total for the stay before checkout, and taxes exactly as the store reports them. Never write "enquire for rates" or "from" without a number.
- **Premium yet affordable:** $140–$520 a night. The copy never says "luxury" or "exclusive". Show the quality through materials, light and care instead.
- **Light Indonesian microcopy**, always next to English and never decoding-required:
  - *Selamat datang* (welcome), *Sampai jumpa* (see you soon), *Terima kasih* (thank you).
  - Times of day: *Pagi* (morning), *Siang* (midday), *Sore* (late afternoon), *Malam* (night).
  - *Sawah* (rice field), *lumbung* (rice barn), *joglo* (Javanese teak house), *bale* (open pavilion).
- Sentence case everywhere except small-caps labels. No exclamation marks. No emoji in UI.
- Writing rules: short sentences, concrete nouns, no invented statistics. The stats we can state come from `site-config.ts` (10 villas, 400 m altitude, about 2 h from DPS airport).

## 2. Colour tokens (`app/globals.css` `@theme`)

| Token | Hex | Use |
|---|---|---|
| `--color-paper` | `#F4EEE4` | page background (limestone) |
| `--color-paper-deep` | `#EDE5D8` | alternate section bg |
| `--color-sand` | `#E7DCCB` | cards on paper, chips, inputs |
| `--color-sand-strong` | `#D9CAB3` | hairline-strong, disabled fills |
| `--color-jungle` | `#1F3A2E` | dark sections, footer, checkout summary, menu overlay |
| `--color-jungle-deep` | `#152920` | jungle hover/pressed, video scrims |
| `--color-jungle-soft` | `#2C4A3C` | raised panels on jungle |
| `--color-terracotta` | `#B4502E` | **the only accent**: primary CTA, prices, active states, pins |
| `--color-terracotta-bright` | `#CC6440` | hover |
| `--color-terracotta-deep` | `#8F3D21` | pressed, text-on-paper links |
| `--color-moss` | `#6E7F4F` | availability "free", success, secondary tags |
| `--color-moss-soft` | `#DCE0CC` | moss tint backgrounds |
| `--color-ink` | `#1E1A16` | body text |
| `--color-ink-muted` | `#6B6158` | secondary text |
| `--color-ink-dim` | `#9A8F84` | tertiary, placeholders |
| `--color-cream` | `#FBF8F2` | text on jungle and video |
| `--color-line` | `rgba(30,26,22,.10)` | hairlines on paper |
| `--color-line-strong` | `rgba(30,26,22,.18)` | |
| `--color-line-on-dark` | `rgba(251,248,242,.14)` | hairlines on jungle |
| `--color-danger` | `#A23B2A` | errors (a red-brown, not fire-engine red) |

- Unavailable nights in the calendar: struck-through `ink-dim` on `paper-deep`.
- Free nights: ink. Selected range: terracotta ends with a `terracotta/12` band between them.
- A grain overlay (`.grain`, an SVG feTurbulence data-URI at 4% opacity, multiply) sits on paper sections and the hero.
- **Contrast:** body text on paper is ink. Cream on jungle and on video always has a scrim (`jungle-deep/45` → transparent gradient).

## 3. Type

- **Display: Fraunces** (next/font/google, variable, `axes: ['opsz','SOFT','WONK']`), `--font-fraunces`.
  - `.display-xl`: clamp(4rem, 12vw, 11rem), weight 300, opsz 144, SOFT 100, tracking −0.035em, line-height 0.9. Used for the **Lumbung wordmark** and the closing word.
  - `.display-lg`: clamp(2.75rem, 6vw, 5.5rem), weight 300, line-height 1.0.
  - `.display-md`: clamp(2rem, 3.6vw, 3.25rem), weight 350.
  - `.display-sm`: 1.6rem, weight 400.
  - **Mixed italic** is the signature: "Ten houses *in the rice fields*". Use `<em>` with `.italic-soft` (italic, SOFT 100, WONK 1, colour terracotta-deep on paper or cream on jungle).
- **UI and body: Figtree** (next/font/google, variable), `--font-figtree`. Body 1rem/1.65, weights 400/500/600.
- **`.label`:** Figtree 600, 0.72rem, uppercase, tracking 0.16em, ink-muted. Used for eyebrows, chips and table heads.
- **`.tabular`:** `font-variant-numeric: tabular-nums lining-nums` for every price, date and countdown.
- **Price style:** `$240` in Fraunces 400 at display-sm with terracotta, then ` / night` in Figtree label style.

## 4. Shape, space, elevation

- **Radius:** cards `24px`, inputs and chips `999px` (pill), buttons pill, images `20px`. **Arch frames** (`.arch`) use `border-radius: 999px 999px 20px 20px / 420px 420px 20px 20px` for villa portrait cards and room-tour images.
- **Container:** `max-w-[1440px]` with `px-5 md:px-10`. Section vertical rhythm `py-24 md:py-36`.
- **Elevation:** almost flat. Cards on paper use sand fill with no shadow. Floating UI (search capsule, reservation card, panels) uses `shadow-[0_24px_60px_-24px_rgba(31,58,46,.35)]` with a 1px `line` ring.
- **Glass:** only over video and photos: `bg-cream/75 backdrop-blur-xl` (the search capsule, hero pin chips).

## 5. Motifs (components in `components/motifs/`)

1. **`<CandiBentar />`: the split gate.** Two mirrored stepped-tower silhouettes (SVG path, jungle fill, fine cream ornament lines).
   - *Hero reveal:* on first visit (sessionStorage flag) both halves sit together over the hero, then slide out left and right over 1.4s with the expo ease. While they open, the wordmark rises through the gap.
   - *Page curtain:* `app/template.tsx` uses a quick (0.6s) half-height version.
   - *Divider:* a small 28px-high cream/terracotta glyph between sections.
2. **`.arch`** image frames (above).
3. **`<TerraceLines />`:** faint contour lines (SVG, `line` colour) as a section background, like the rice terraces seen from above.
4. **`<IkatRule />`:** a 12px-high repeating ikat/songket diamond line, used as a divider in terracotta at 40%.
5. **`<CanangSari />`:** a small offering-basket illustration (square tray, petals in the 4 colours of the 4 directions: white, red, yellow, blue-black → cream, terracotta, ochre `#C99A3B`, jungle) for loading and empty states, with a gentle rotation when loading.
6. **`<LumbungMark />`:** the logo. A lumbung A-frame roof in an arch, outlined. Wordmark "Lumbung" in Fraunces with a small-caps "SIDEMEN · BALI" descriptor.

## 6. Motion

- Reuse NOIR's `components/motion/*`: Reveal, RevealText, RevealImage, ParallaxImage, CountUp, Marquee, MagneticButton, PageTransition, ScrollProgress, SmoothScroll.
- Import `useReducedMotion` from `@/components/motion/use-reduced-motion` only, **never** from framer-motion.
- Eases: `expo = [0.16, 1, 0.3, 1]` and `soft = [0.33, 1, 0.68, 1]`. Durations 0.5–1.4s. Every variant and transition is a module-scope const.
- **Signature motions:**
  - The gate reveal.
  - Hero pins pop in (scale 0.6→1, then a pulse ring) when their keyframe span begins, and fade out when it ends.
  - Captions slide in on a thin terracotta line.
  - The room-tour scroller snaps with a parallax image inside the arch.
  - Day↔Dusk is a 900ms cross-fade, with a small sun/moon glyph rotating.
- Reduced motion: no gate (it starts open), no parallax, and the video is paused on its poster with static pins.

## 7. Z-index map
| Layer | z |
|---|---|
| header | 60 |
| floating panels (date/guest pickers) | 62 |
| menu overlay | 55 |
| lightbox | 80 |
| mobile booking sheet | 66 (scrim 65) |
| cart-hold toast | 64 |
| gate / page curtain | 70 |
| scroll progress | 61 |

## 8. Component inventory (who builds what)
- **Foundation [C]:**
  - `components/ui/*`: Button (`primary` terracotta, `secondary` jungle, `outline`, `ghost`, `glass`; sizes sm/md/lg; pill), Input, Textarea, Select, Chip, Stepper (−/n/+), Sheet, Dialog, Tabs, SafeImage, FloatingPanel, Listbox, PriceTag, Badge, CountdownText.
  - `components/stay/*`: StayCalendar (range calendar with unavailable nights, min nights and check-in/out labels), GuestPicker (adults/children/infants with the villa's max), DateGuestField (a trigger that opens both).
  - `components/motifs/*`, `components/motion/*`, `components/layout/*` (header, footer, menu overlay, wordmark, the "In Sidemen now" strip), and `components/villas/villa-card.tsx` (the shared arch card, used by home, list and similar villas).
- **[C1] Home:** `components/home/*`.
- **[C2] Villas:** `components/villas/*` (except villa-card) and `components/villa/*` (the detail page).
- **[C3] Reserve:** `components/reserve/*`.
- **[C4] Account and auth:** `components/account/*`, `components/auth/*`.
- **[C5] Story pages:** `components/marketing/*`, `lib/seo.ts`, `content/journal/*`.

## 9. Page wireframes (desktop; mobile stacks)

### Home `/`
```
┌──────────────────────────── HEADER (transparent over hero → paper on scroll) ─────────────┐
│ [LumbungMark] Lumbung        Villas  Experiences  Getting there  About      [My trips] (Book)│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  ░░ HERO: flyover video, full-bleed, 100svh ░░  candi-bentar gate opens on first visit     │
│     • Joglo Agung $420  ← pins drift with the video, click → villa                          │
│                       • Rumah Sawah $190                                                    │
│   "10 private villas" ─── (timed caption on a terracotta rule)                              │
│                                                                                             │
│   L u m b u n g        (display-xl, cream)                                                  │
│   Ten houses *in the rice fields* · Sidemen, Bali                                           │
│   ╭ glass search capsule ──────────────────────────────────────────────────╮               │
│   │ Check in  Fri 14 Nov │ Check out  Mon 17 Nov │ Guests 2 adults │ (Search) │               │
│   ╰───────────────────────────────────────────────────────────────────────╯               │
│ In Sidemen now · 06:42 · 24°C                         scroll ↓          ◉ sound off  ❚❚     │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ THE VALLEY: editorial split (big italic statement + 2 offset photos + 3 facts)             │
│ THE VILLAS: horizontal arch-card carousel (photo, name, type, guests·beds, $/night)        │
│ THE MAP: illustrated site plan (SVG), 10 hotspots, hover card, "Find your house"           │
│ A DAY AT LUMBUNG: Pagi / Siang / Sore / Malam timeline with photos                         │
│ EXPERIENCES: mosaic (sunrise trek, weaving, cooking, spa…) with prices as add-ons          │
│ PRICE PROMISE: what's included / not / how taxes are shown                                 │
│ GUESTS SAY: testimonials marquee                                                           │
│ JOURNAL: 3 cards · FAQ accordion                                                           │
│ CLOSING: jungle band, "Sampai jumpa" + giant terracotta wordmark bleeding off the bottom   │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Villa `/villas/[slug]`
```
breadcrumb · Villas / Joglo Jati
┌ gallery mosaic: 1 big (arch-top) + 4 small, "View all 11 photos" ────────── Day ◐ Dusk ┐
└────────────────────────────────────────────────────────────────────────────────────────┘
JOGLO JATI (display-lg) · Teak joglo with a private pool           ┌ RESERVATION CARD (sticky) ┐
facts: 85 m² · 3 guests · 1 bedroom · 1 bath · private pool · terrace │ $240 / night            │
                                                                      │ [Check in | Check out]  │
story (2 paragraphs, italic pull quote)                               │ [Guests  2 adults    ▾] │
ROOM BY ROOM: horizontal snap scroller of arch images                 │ $240 × 3 nights   $720  │
   Living pavilion · Bedroom · Outdoor bath · Pool deck · View        │ Taxes calculated at     │
   (room name, bed setup, 3 features each)                            │ checkout                │
VILLA FILM: 8s clip band, muted loop, play/pause                      │ (Reserve)  terracotta   │
FLOOR PLAN: SVG with room labels, hover links to room tour            │ Free cancellation until │
AMENITIES: icon grid · SLEEPING: bed cards                            │ 31 Oct · min 2 nights   │
WHERE IT IS: mini site map with this villa highlighted                └─────────────────────────┘
HOUSE RULES · CANCELLATION timeline · REVIEWS · SIMILAR VILLAS (3 arch cards)
```

### Reserve `/reserve/[slug]`
```
← Back to Joglo Jati                        Secure booking · 🔒            We're holding it for 14:32
┌ LEFT (paper) ───────────────────────────────────┐ ┌ RIGHT: jungle summary (sticky) ─────┐
│ ① Your stay  ✓ Fri 14 → Mon 17 Nov · 2 adults [Edit] │ [photo, arch]                        │
│ ② Make it yours (add-on cards with photo, +/−)  │ Joglo Jati · Teak joglo, private pool │
│ ③ Guest & arrival (details, arrival time, flight,│ Check in  Fri 14 Nov · from 15:00     │
│    occasion, questions, requests)               │ Check out Mon 17 Nov · by 11:00       │
│ ④ Payment (promo code, Stripe, policy ☐) (Pay)  │ 3 nights × $240 ............ $720     │
│                                                 │ Floating breakfast ........... $28    │
│                                                 │ Taxes ........................ $x     │
│                                                 │ Total (USD) ................. $xxx    │
│                                                 │ ◷ Free cancellation until 31 Oct      │
└─────────────────────────────────────────────────┘ └──────────────────────────────────────┘
```

### Account `/account`
```
Selamat datang, Maya.
┌ NEXT TRIP hero (villa photo bg, jungle scrim): Joglo Jati · in 23 days · Fri 14 → Mon 17 Nov ┐
│ [View trip]  [Add airport transfer]  arrival details: 2 adults · flight GA 404 ~16:30           │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
Upcoming (cards) · Past stays (cards with "Leave a review" / "Book again") · Profile
```

## 10. Imagery direction (for the media agent)
- **Light:** soft tropical light, either golden hour or after-rain overcast. Humid air, mist in the valley in the mornings.
- **Palette in frame:** rice-field greens, teak, alang-alang thatch, volcanic stone, terracotta tiles, cream linen. **No** purple sunsets, no infinity-pool-at-cliff clichés, no tropical neon.
- **People:** almost none. A host's hand placing an offering, a figure far away in the paddy, at most. Never a face close up in villa shots.
- **Honesty:** affordable-premium, so lived-in textures, real proportions and real Balinese materials. Nothing that looks like a 5-star chain.
- Every image is photorealistic, editorial and magazine-grade, with **no text, no logos, no watermarks**.
