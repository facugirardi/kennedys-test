# Login Page — Design Spec

**Date:** 2026-03-27
**Status:** Approved

## Overview

Convert the login/register modal into a standalone `/login` page. All entry points that previously opened the modal now navigate to `/login`, with a `?returnTo=` query param so the user lands back where they were after authenticating.

## Architecture

### New file: `pages/login.tsx`

- Renders `RegisterForm` full-page (no modal wrapper)
- Reads `router.query.returnTo` (string, defaults to `'/'`)
- If user is already authenticated, redirects to `returnTo` immediately
- Navbar rendered with `textBlack` prop
- Passes `returnTo` to `RegisterForm`
- Passes `setShowRegisterForm={(open) => { if (!open) router.back() }}` so the X button navigates back instead of closing a modal

### Modified: `components/custom/RegisterForm.tsx`

- Add optional prop `returnTo?: string`
- `handleLogin` (currently redirects to `/my-profile`): redirect to `returnTo || '/my-profile'`
- `success` step "Go to profile" button (currently redirects to `/my-profile`): redirect to `returnTo || '/my-profile'`
- No other changes

### Modified: `components/custom/Navbar.tsx`

- Desktop "Log In" button (line ~308): replace `openLoginsignup` with `router.push('/login')`
- Mobile "Log In" button (line ~210): same
- Remove: `PortalPopup` import and usage, `Loginsignup` import and usage
- Remove: `isLoginModalOpen`, `openLoginModal`, `closeLoginModal`, `openLoginsignup`, `closeLoginsignup`
- Remove: `useLoginModal` import

### Modified: 6 files calling `openLoginModal()`

Each occurrence is replaced with:
```ts
router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
```

Files:
- `components/ConciergeDetailPage.tsx`
- `components/ConciergeCard.tsx`
- `pages/villas/list/index.tsx`
- `pages/villas/index.tsx`
- `pages/index.tsx`
- `pages/villas/[id]/index.tsx`

Remove `useLoginModal` import from each.

### Deleted files

- `components/loginsignup.tsx` — only used by Navbar
- `src/contexts/LoginContext.tsx` — no longer needed

### Modified: `pages/_app.tsx`

- Remove `LoginProvider` wrapper from the provider tree
- Remove `LoginContext` import

## Data flow

```
User clicks "Log In" (Navbar)
  → router.push('/login')

User clicks protected action (like, book, etc.)
  → router.push('/login?returnTo=/villas/123')

/login page renders RegisterForm
  → user completes login or registration
  → RegisterForm redirects to returnTo || '/my-profile'

User clicks X on /login
  → router.back()
```

## Error handling

- If `returnTo` contains an external URL (not starting with `/`), the page ignores it and falls back to `'/'`
- Already-authenticated users hitting `/login` are immediately redirected to `returnTo || '/'`

## Files changed summary

| File | Action |
|------|--------|
| `pages/login.tsx` | Create |
| `components/custom/RegisterForm.tsx` | Modify (add `returnTo` prop) |
| `components/custom/Navbar.tsx` | Modify (remove modal, add router.push) |
| `components/ConciergeDetailPage.tsx` | Modify |
| `components/ConciergeCard.tsx` | Modify |
| `pages/villas/list/index.tsx` | Modify |
| `pages/villas/index.tsx` | Modify |
| `pages/index.tsx` | Modify |
| `pages/villas/[id]/index.tsx` | Modify |
| `pages/_app.tsx` | Modify |
| `components/loginsignup.tsx` | Delete |
| `src/contexts/LoginContext.tsx` | Delete |
