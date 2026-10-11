# Bali Villa Rentals: an Opencals booking template for villa stays

An open-source Next.js 15 template for villa and holiday-rental sites. The demo
brand is **Lumbung Sidemen**, a 10-villa resort in Sidemen, Bali, with
nightly stays (check-in 15:00, check-out 11:00), built on
[`@opencals/storefront-sdk`](https://www.npmjs.com/package/@opencals/storefront-sdk).

![Lumbung Sidemen: the storefront on a laptop and phone, on a teak table in a thatched bale above the Sidemen rice terraces, with Mount Agung behind](docs/cover.png)

> Work in progress. Full setup docs and the deploy button come later.

## Screenshots

![Homepage hero: a drone flyover of the valley with live price pins on each villa and the dates search](docs/homepage-hero.png)

![The site map: all ten houses numbered on one hillside of terraces, with nightly prices](docs/site-map.png)

![The villas list: arched photo cards with the nightly price, guests, bedrooms and minimum stay](docs/villas.png)

![A villa page (Joglo Agung): the day/dusk hero photo and the gallery grid](docs/villa-page.png)

![Reserve: the two-month stay calendar with booked nights struck through, and the stay summary](docs/reserve.png)

![On mobile: a villa page with the sticky price and Check dates bar](docs/mobile.png)

![My trips: the next stay with a countdown, arrival details and quick actions](docs/account.png)

![A trip page: change dates or cancel, the stay details with extras, payment, the house manual and directions](docs/trip.png)

## Quick start

```bash
cp .env.example .env.local   # set your Opencals API URL and storefront key
npm install
npm run dev
```

Seed a store with the `villa_resort` dataset in the Opencals dashboard.

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run typecheck`, `npm run lint`, `npm test`

See `CLAUDE.md` for conventions and `DESIGN.md` for the design system.
