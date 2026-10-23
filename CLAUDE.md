# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Build for production (--no-lint flag is intentional)
npm run lint      # Run ESLint
npm start         # Start production server
```

## Architecture

**Next.js 14 Pages Router** — this project uses `/pages/` (not App Router). All routes are in `pages/`.

### Key directories

- `pages/` — routes. Dynamic routes: `villas/[id]`, `real-estate/[id]`, `agent-property/[id]`, `events/[id]`, `concierge/[...slug]`, `experiences/[city]`, `agent-offers/[slug]`, `shared-properties/[slug]`
- `components/custom/` — main reusable components (Navbar, Footer, Calendar, forms, etc.)
- `components/promotional-blocks/` — CMS-driven blocks exported from `index.ts`; fetched via `getPageBlocksData()` + `getBlockDataForType()`
- `lib/api/` — all API calls using axios. Central fetcher at `lib/api/fetcher.js`
- `lib/utils.ts` — shared utilities: `cn()`, `resolveMediaUrl()`, `formatCurrency()`, date formatters, price helpers
- `lib/utils/contentBlocks.ts` — helpers for page-level CMS blocks
- `lib/seo/` — SEO utilities: `config.ts` (SITE_NAME, getSiteUrl, absoluteUrl), `propertyJsonLd.ts`, `homeJsonLd.ts`, `sitemapBuilder.ts`
- `lib/offerVillaPriceDisplay.ts` — price helpers for shared offers: `getVillaOfferFinalTotal()`, `getVillaOfferOfficialTotal()`, `formatVillaOfferDiscountLabel()`
- `app/lib/api/sharePropertiy.js` — API for shared offers (note: path is `app/lib/`, not `lib/api/`; typo "Propertiy" is intentional in filename)
- `components/seo/SeoHead.tsx` — unified SEO `<Head>` component with canonical, OG, Twitter, JSON-LD support
- `components/shared-offers/` — UI for shared property offer pages (SharePropertiesPage, SharedOfferPage, ServiceOfferCard)
- `src/contexts/` — React contexts: `AuthContext`, `LoginContext`, `ContactContext`
- `src/hooks/` — custom hooks (e.g., `usePropertyLikes`)
- `store/propertyStore.js` — Zustand store for selected property
- `interfaces/property.ts` — TypeScript types for Property

### Path alias

`@/` maps to the project root. Example: `@/lib/api/properties`, `@/components/custom/Navbar`.

### API layer

All HTTP calls go through `lib/api/fetcher.js`:
- `fetchAPI(endpoint, options)` — GET by default; always returns a value (never throws); errors return `{ success: false, ... }`
- `mutateAPI(endpoint, method, data)` — wraps fetchAPI for mutations
- `setAuthToken(token)` / `clearAuthToken()` — set Bearer token on the axios instance
- `resolveMediaUrl(path)` — use this for all media/image URLs from the API (strips `/api` from base URL)

Base URL: `NEXT_PUBLIC_API_URL` (default: `https://api.kennedys.group/api`)

### SEO

Use `SeoHead` from `components/seo/SeoHead.tsx` on all pages. Requires `NEXT_PUBLIC_SITE_URL` env var for canonical URLs and Open Graph. Accepts: `title`, `description`, `canonicalPath`, `imageUrl`, `noindex`, `jsonLd` (JSON-LD objects).

### Auth

`AuthContext` stores JWT token in `localStorage` (`authToken`, `authUser` keys). Use `useAuth()` hook. The `AuthProvider` in `_app.tsx` holds children until `loading` is false.

### SSR status

Some pages have `getServerSideProps`, most still use client-side fetching. The pattern for SSR pages: `getServerSideProps` calls API with `Promise.all`, passes `initialData` as props; the component uses props when available and skips the client-side fetch. See `PLAN-SSR-SITIO-COMPLETO.md` for the migration roadmap.

Pages already using SSR: `villas/[id]`, `villas/index`, `agent-property/[id]`, `agent-offers/[slug]`, `shared-properties/[slug]`, `about-us`.

### Promotional / CMS blocks

Pages use `getPageBlocksData(pageKey)` + `getBlockDataForType(blocks, blockType)` to pull content from the CMS. Blocks are only rendered if `enabled` and `contentBlock.published` are both true.

## Critical rules

### Git: work directly on `main`

Do not create separate branches for changes. Commit directly to `main` (this overrides any default "branch first" behavior). Only create a branch if the user explicitly asks for one.

### Rental ↔ Agent Property sync

When modifying `pages/villas/[id]/index.tsx`, **always apply the same change to `pages/agent-property/[id]/index.tsx`**. These pages serve the same content at different URLs. Sync: data mapping (`mapPropertyToView`), UI blocks, imports. Naming differs slightly (e.g., `emptyVillaStructure` vs `emptyAgentPropertyStructure`).

### Real Estate section is a mockup (work in progress)

The whole `/real-estate` section is a **mockup that is not defined yet and still in progress**: `pages/real-estate/index.tsx`, `list/`, `in-city/`, `location/[location]`, plus `components/RealStatePage.tsx` and `components/custom/RealEstateFilterOverlay.tsx`. Layout, content, data flow and behavior may still change entirely. Do not treat its current structure as the final reference, do not copy patterns from it into other sections, and do not refactor or "complete" it unless the user asks. `real-estate/[id]` reuses `villas/[id]` with `detailVariant="real-estate"`.

### No mock/hardcoded fallback data

Never use hardcoded prices, text, or numbers as fallbacks. Use empty strings, `null`, or empty arrays. If there's no API data, show nothing.
