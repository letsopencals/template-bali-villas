# Bali Villa Rentals: an Opencals booking template for villa stays

An open-source Next.js 15 template for villa and holiday-rental sites. The demo
brand is **Lumbung Sidemen**, a 10-villa resort in Sidemen, Bali, with
nightly stays (check-in 15:00, check-out 11:00), built on
[`@opencals/storefront-sdk`](https://www.npmjs.com/package/@opencals/storefront-sdk).

> Work in progress. Full setup docs, screenshots and the deploy button come later.

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
