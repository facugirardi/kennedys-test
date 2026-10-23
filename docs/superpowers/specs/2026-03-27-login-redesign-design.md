# Login Page Redesign — Design Spec

**Date:** 2026-03-27
**Status:** Approved

## Overview

Rediseñar `/login` con layout split 50/50 inspirado en LeCollectionist: imagen de villa full-height a la izquierda, panel blanco con logo + form a la derecha. El Navbar fijo se mantiene.

## Layout — `pages/login.tsx`

- Viewport completo, flex row
- **Panel izquierdo (50%)**: `registerImage` (ya importada en RegisterForm), `object-cover`, `h-screen`, `sticky top-0` — no scrollea
- **Panel derecho (50%)**: fondo blanco, scrolleable. Contenido centrado verticalmente con `padding-top` para el Navbar fijo (~80px):
  - Logo Kennedy's oscuro (`/images/capa-1-3.svg`)
  - Tagline: texto pequeño uppercase, e.g. `"WELCOMES YOU"`
  - Contenido del `RegisterForm` (sin wrapper propio)

## Cambios — `RegisterForm`

- Eliminar el wrapper `grid grid-cols-1 md:grid-cols-[...]` externo
- Eliminar la columna de imagen (el `<div>` con la `<img>`)
- El componente renderiza solo el step activo directamente
- El botón X se reposiciona: absoluto en el panel derecho de `login.tsx`, no dentro de `RegisterForm`
- Toda la lógica de steps, validaciones, y `returnTo` sin cambios

## Lo que NO cambia

- Steps: email → login → registerDetails → verification → success
- Lógica de auth, `isSafeRedirect`, `returnTo`
- El Navbar (`textBlack`)

## Files

| Archivo | Acción |
|---------|--------|
| `pages/login.tsx` | Modificar — nuevo layout split |
| `components/custom/RegisterForm.tsx` | Modificar — quitar wrapper y columna de imagen |
