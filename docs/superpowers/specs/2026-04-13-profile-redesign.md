# Profile Page Redesign — Design Spec
Date: 2026-04-13

## Decisions
- **Layout**: Option A — Top tabs + dark banner header, contenido full-width
- **Style**: Option 2 — Modern Cards (cards blancas con sombra, fondo gris, tabs oscuras)
- **Edit mode**: Option B — Slide-out panel lateral con overlay oscuro

---

## Scope

Rediseño completo de `components/myProfilePage.tsx`. La página `pages/my-profile.tsx` no cambia. Toda la lógica de negocio (API calls, auth, favoritos, toggle like) se preserva exactamente — solo cambia la UI.

---

## 1. Header (todas las tabs)

Banner oscuro con gradiente `#172338 → #223358` (de izq a der).

**Contenido:**
- Avatar cuadrado con bordes redondeados (`border-radius: 10px`), gradiente dorado `#D99330 → #f0c060`, iniciales del usuario en blanco bold. Tamaño: 44×44px.
- Nombre completo en blanco, `font-weight: 600`, `font-size: 15px`
- Badge "✦ Member" — fondo `rgba(217,147,48,0.2)`, borde `rgba(217,147,48,0.4)`, texto `#f0c060`, pill pequeño
- Botón "Log out" alineado a la derecha, texto blanco semitransparente, underline, `font-size: 12px`

**Tabs** — barra separada con fondo `#172338` (mismo tono que header, 1px más oscura con border-bottom):
- Items: MY PROFILE · MY FAVORITES · MY TRIPS
- Estado activo: texto `#D99330`, border-bottom `2px solid #D99330`
- Estado inactivo: texto `rgba(255,255,255,0.40)`
- `font-size: 11px`, `letter-spacing: 0.12em`, uppercase

---

## 2. Tab: My Profile

**Layout general:** fondo `#f5f3ef`, padding `24px`, tres cards en columna (mobile) o grid adaptado (desktop).

### Cards en modo lectura

Cada card: `background: white`, `border-radius: 10px`, `box-shadow: 0 1px 6px rgba(0,0,0,0.06)`, `padding: 20px 24px`.

**Header de card:**
- Label uppercase pequeño (`font-size: 11px`, `letter-spacing: 0.12em`, color `#9a8f80`)
- Botón "Edit" alineado a la derecha: `background: transparent`, `border: 1px solid #D99330`, `color: #D99330`, `border-radius: 5px`, `padding: 4px 12px`, `font-size: 11px`, uppercase

**Campos en modo lectura:**
- Layout: `display: flex; flex-direction: column; gap: 16px; margin-top: 16px`
- Cada campo: label `font-size: 10px` uppercase `color: #9a8f80` + valor `font-size: 14px` `color: #172338` `font-weight: 500`
- Si el valor está vacío o null: mostrar `—` en color `#c5bdb3` (no "Not provided")

**Cards:**
1. **Personal Info** — First Name, Last Name, Birthday (formateado "Month DD, YYYY"), Nationality
2. **Contact Details** — Email, Phone, Address, City, Postal Code
3. **Security** — Fila con label "Password" + valor "••••••••" + botón "Change Password" (abre slide panel igual que Edit)

**Grid desktop:** Personal Info y Contact Details en la misma fila (`grid-cols-2`), Security debajo a ancho completo en desktop.

---

## 3. Slide Panel (modo edición)

Se activa al hacer click en "Edit" o "Change Password" en cualquier card.

**Overlay:** `position: fixed; inset: 0; background: rgba(23,35,56,0.5); z-index: 50`

**Panel:**
- Desliza desde la derecha con `transform: translateX(100%)` → `translateX(0)`, `transition: 0.25s ease`
- Ancho: `420px` en desktop, `100%` en mobile
- Fondo: `white`, `height: 100%`, `overflow-y: auto`
- `padding: 32px 28px`

**Contenido del panel:**
- Botón X cerrar en esquina superior derecha
- Título de la sección (`font-size: 16px`, uppercase, `#172338`)
- Separador `border-bottom: 1px solid #e5e0d8`, `margin-bottom: 24px`
- Campos del formulario en columna (`gap: 20px`)
- Cada campo: label uppercase `font-size: 11px` `#9a8f80` + input con `border: 1px solid #e5e0d8`, `border-radius: 6px`, `padding: 10px 14px`, focus → `border-color: #D99330`, `ring: 1px #D99330`
- **Botones:**
  - "Save Changes": `background: #172338`, `color: white`, full-width, `padding: 12px`, uppercase, `letter-spacing: 0.1em`
  - "Cancel": texto `#9a8f80`, underline, centrado, debajo del Save
- Mensajes de éxito/error inline debajo del form (sin toast externo)

**Panels disponibles:**
- `personal` — firstName, lastName, birthday (date input), nationality
- `contact` — email, phone, address, postalCode, city
- `password` — newPassword, confirmPassword (mínimo 8 chars)

---

## 4. Tab: My Favorites

**Header de sección:** Título "MY FAVORITES (N)" en `font-gtsuper-ds` + sort control derecha.

**Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`

**Cards rediseñadas** (mantienen funcionalidad actual):
- Imagen: `h-52 object-cover`, esquinas sin redondear (estilo editorial)
- Botón favorito: círculo blanco top-right, corazón rojo
- Body: padding `16px 20px`
- Título: `font-size: 18px` `font-haas font-light text-[#506A70]`
- Location: icono MapPin pequeño + texto `text-sm text-[#303D40]`
- Specs (bedrooms/guests/pools): `text-xs text-[#B17520] font-medium` en una línea
- Precio: `font-haas font-medium text-[#172338]` + label FROM si aplica

**Empty state:** texto explicativo + links a `/villas/list`, `/concierge/list`, `/events/list`

---

## 5. Tab: My Trips

Empty state:
- Título "MY TRIPS" en `font-gtsuper-ds`
- Párrafo explicativo
- Link "Explore stays" → `/villas/list`

Sin cambios funcionales respecto al estado actual (no hay datos reales de trips).

---

## 6. Skeletons

Los tres skeletons existentes (`ProfileSectionSkeleton`, `FavoritesGridSkeleton`, `TripsSectionSkeleton`) se actualizan para reflejar la nueva estructura de cards.

---

## 7. Responsive

- Mobile (`< md`): todo en columna. Tabs en fila scrollable horizontal si no caben. Slide panel: 100% width.
- Desktop (`≥ md`): header con avatar + info en fila. Cards en grid 2 cols. Slide panel: 420px fijo desde derecha.

---

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `components/myProfilePage.tsx` | Reescritura completa de JSX/clases. Lógica intacta. |

No se crean archivos nuevos. No se modifica `pages/my-profile.tsx`.

---

## Invariantes (no tocar)

- Toda la lógica de estado: `loadProfile`, `loadFavorites`, `handleToggleFavorite`, `handleRemoveEventFavorite`, `handleProfileSubmit`, `handleContactSubmit`, `handlePasswordSubmit`
- API calls: `getUser`, `patchUser`, `getUserPropertyLikes`, `getUserServiceLikes`, `togglePropertyLike`
- Helpers de precio e imagen: `normalizePrice`, `getVillaListHeroUrl`, `getRentalListDisplayPrice`, etc.
- Tipos TypeScript: `FavoriteProperty`, `FavoriteServiceRow`, `ProfileFavoriteRow`, `ProfileNavTab`
