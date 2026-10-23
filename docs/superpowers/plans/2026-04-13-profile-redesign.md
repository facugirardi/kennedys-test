# Profile Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la UI de `components/myProfilePage.tsx` con banner oscuro + tabs doradas, cards blancas con sombra sobre fondo gris, y slide-out panel para edición — preservando toda la lógica de negocio existente.

**Architecture:** Edición de un solo archivo. Toda la lógica de estado, API calls, helpers y tipos permanece intacta. Los cambios son: (1) consolidar tres booleans de edición en un `activePanel` discriminado, (2) reemplazar todo el JSX de render con el nuevo sistema de diseño, (3) añadir slide-out panel overlay para edición.

**Tech Stack:** Next.js 14 Pages Router, React 18, TypeScript, Tailwind CSS, fuentes `font-gtsuper-ds` / `font-haas`, colores Kennedy's (`#D99330` dorado, `#172338` navy oscuro).

---

### Task 1: Consolidar estados de edición en `activePanel`

**Files:**
- Modify: `components/myProfilePage.tsx`

Reemplazar los tres booleanos de edición independientes (`isEditingProfile`, `isEditingContact`, `showPasswordForm`) por un único estado discriminado para controlar el slide panel.

- [ ] **Step 1: Añadir el type alias `ActivePanel` a nivel de módulo**

Insertar justo antes de la declaración de la función `MyProfilePage` (antes de `export const MyProfilePage`):
```typescript
type ActivePanel = 'personal' | 'contact' | 'password' | null
```

- [ ] **Step 2: Reemplazar los tres estados de edición**

Buscar estas tres líneas (alrededor de línea 526–528):
```typescript
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
```
Reemplazar con:
```typescript
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
```

- [ ] **Step 3: Actualizar `handleProfileSubmit` — cerrar panel en éxito**

Buscar en `handleProfileSubmit` (alrededor de línea 924):
```typescript
      setProfile(updatedUser)
      refreshUser(updatedUser)
      setIsEditingProfile(false)
      setProfileMessage('Profile updated successfully.')
```
Reemplazar con:
```typescript
      setProfile(updatedUser)
      refreshUser(updatedUser)
      setActivePanel(null)
      setProfileMessage('Profile updated successfully.')
```

- [ ] **Step 4: Actualizar `handleContactSubmit` — cerrar panel en éxito**

Buscar en `handleContactSubmit` (alrededor de línea 982):
```typescript
      setProfile(updatedUser)
      refreshUser(updatedUser)
      setIsEditingContact(false)
      setContactMessage('Contact details saved successfully.')
```
Reemplazar con:
```typescript
      setProfile(updatedUser)
      refreshUser(updatedUser)
      setActivePanel(null)
      setContactMessage('Contact details saved successfully.')
```

- [ ] **Step 5: Actualizar `handlePasswordSubmit` — cerrar panel en éxito**

Buscar en `handlePasswordSubmit` (alrededor de línea 1021):
```typescript
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      setPasswordError(null)
      setShowPasswordForm(false)
      setPasswordMessage('Password updated successfully.')
```
Reemplazar con:
```typescript
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      setPasswordError(null)
      setActivePanel(null)
      setPasswordMessage('Password updated successfully.')
```

- [ ] **Step 6: Commit**

```bash
git add components/myProfilePage.tsx
git commit -m "refactor: consolidate profile edit states into activePanel"
```

---

### Task 2: Actualizar los tres Skeletons

**Files:**
- Modify: `components/myProfilePage.tsx` (componentes skeleton al inicio del archivo, líneas ~45–149)

- [ ] **Step 1: Reemplazar `ProfileSectionSkeleton`**

Buscar el componente completo `const ProfileSectionSkeleton` (líneas ~45–78) y reemplazarlo:
```tsx
const ProfileSectionSkeleton = () => (
  <div className="flex flex-col gap-5 w-full" aria-busy="true" aria-label="Loading profile">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[0, 1].map((i) => (
        <div key={i} className="bg-white rounded-[10px] shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBar className="h-3 w-28" />
            <SkeletonBar className="h-7 w-14 rounded" />
          </div>
          <div className="space-y-4 pt-2">
            {[0, 1, 2].map((j) => (
              <div key={j} className="space-y-1">
                <SkeletonBar className="h-2.5 w-20" />
                <SkeletonBar className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-[10px] shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-3 w-24" />
        <SkeletonBar className="h-7 w-36 rounded" />
      </div>
    </div>
  </div>
)
```

- [ ] **Step 2: Reemplazar `FavoritesGridSkeleton`**

Buscar el componente completo `const FavoritesGridSkeleton` (líneas ~80–106) y reemplazarlo:
```tsx
const FavoritesGridSkeleton = () => (
  <div className="w-full" aria-busy="true" aria-label="Loading favourites">
    <div className="flex items-center justify-between mb-6">
      <SkeletonBar className="h-6 w-52" />
      <SkeletonBar className="h-9 w-40 rounded" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow-sm">
          <SkeletonBar className="h-52 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <SkeletonBar className="h-5 w-4/5" />
            <SkeletonBar className="h-3.5 w-3/5" />
            <SkeletonBar className="h-3.5 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
```

- [ ] **Step 3: Reemplazar `TripsSectionSkeleton`**

Buscar el componente completo `const TripsSectionSkeleton` (líneas ~131–149) y reemplazarlo:
```tsx
const TripsSectionSkeleton = () => (
  <div className="w-full space-y-4" aria-busy="true" aria-label="Loading trips">
    <SkeletonBar className="h-6 w-36 mb-4" />
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex gap-4 bg-white rounded-[10px] shadow-sm p-4">
        <SkeletonBar className="h-20 w-20 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3 py-1">
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-3 w-1/2" />
          <SkeletonBar className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
)
```

- [ ] **Step 4: Commit**

```bash
git add components/myProfilePage.tsx
git commit -m "ui: update profile skeletons for new card layout"
```

---

### Task 3: Actualizar `PROFILE_FAVORITE_CARD_SHELL`

**Files:**
- Modify: `components/myProfilePage.tsx` (constante alrededor de línea 109)

- [ ] **Step 1: Reemplazar la constante de shell de card de favoritos**

Buscar (alrededor de línea 109–110):
```typescript
const PROFILE_FAVORITE_CARD_SHELL =
  'flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border border-[#A3A3A3] bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg'
```
Reemplazar con:
```typescript
const PROFILE_FAVORITE_CARD_SHELL =
  'flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-white shadow-[0_1px_6px_rgba(0,0,0,0.07)] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]'
```

- [ ] **Step 2: Commit**

```bash
git add components/myProfilePage.tsx
git commit -m "ui: remove border from favorite card shell, use shadow-only style"
```

---

### Task 4: Añadir helper `ProfileField` y función `renderSlidePanel`

**Files:**
- Modify: `components/myProfilePage.tsx`

Estas dos piezas deben definirse antes de que el `return` principal las use.

- [ ] **Step 1: Añadir `ProfileField` como componente de módulo**

Insertar justo antes de `type ActivePanel = ...` (antes de `export const MyProfilePage`):
```tsx
const ProfileField = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">{label}</span>
    <span className="text-sm text-[#172338] font-medium">
      {value ? value : <span className="text-[#c5bdb3]">—</span>}
    </span>
  </div>
)
```

- [ ] **Step 2: Añadir `renderSlidePanel` dentro de `MyProfilePage`**

Insertar esta función justo antes del `return (` principal del componente (después de las constantes `navItemButtonClass` / `navLinkLabelClass` que se eliminarán en Task 5):

```tsx
  const renderSlidePanel = () => {
    if (!activePanel) return null

    const titles: Record<NonNullable<ActivePanel>, string> = {
      personal: 'Edit Personal Info',
      contact: 'Edit Contact Details',
      password: 'Change Password',
    }

    const handleClose = () => {
      setActivePanel(null)
      setProfileMessage(null)
      setContactMessage(null)
      setPasswordMessage(null)
      setPasswordError(null)
    }

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-[#172338]/50 z-40"
          onClick={handleClose}
          aria-hidden
        />
        {/* Panel */}
        <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 overflow-y-auto shadow-[-4px_0_32px_rgba(0,0,0,0.18)] flex flex-col">
          {/* Header del panel */}
          <div className="flex items-center justify-between px-7 py-6 border-b border-[#e5e0d8]">
            <h2 className="font-gtsuper-ds text-sm uppercase tracking-[0.12em] text-[#172338]">
              {titles[activePanel]}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-[#9a8f80] hover:text-[#172338] transition text-xl leading-none"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Body del panel */}
          <div className="flex-1 px-7 py-8">
            {activePanel === 'personal' && (
              <form className="flex flex-col gap-5" onSubmit={handleProfileSubmit}>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">First Name</span>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="border border-[#e5e0d8] rounded-md px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">Last Name</span>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="border border-[#e5e0d8] rounded-md px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">Birthday</span>
                  <input
                    type="date"
                    value={profileForm.birthday}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, birthday: e.target.value }))}
                    className="border border-[#e5e0d8] rounded-md px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">Nationality</span>
                  <input
                    type="text"
                    value={profileForm.nationality}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, nationality: e.target.value }))}
                    className="border border-[#e5e0d8] rounded-md px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                {profileMessage && (
                  <p className={`text-sm font-haas ${profileMessage.includes('success') ? 'text-[#2a7a4a]' : 'text-[#D04444]'}`}>
                    {profileMessage}
                  </p>
                )}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full bg-[#172338] text-white text-xs tracking-[0.14em] uppercase py-3.5 rounded-md disabled:opacity-50 hover:bg-[#1e2e4a] transition"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] underline text-center">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activePanel === 'contact' && (
              <form className="flex flex-col gap-5" onSubmit={handleContactSubmit}>
                {(
                  [
                    { field: 'email', label: 'Email', type: 'email' },
                    { field: 'phoneNumber', label: 'Mobile Phone', type: 'tel' },
                    { field: 'address', label: 'Address', type: 'text' },
                    { field: 'postalCode', label: 'Postal Code', type: 'text' },
                    { field: 'city', label: 'City', type: 'text' },
                  ] as const
                ).map(({ field, label, type }) => (
                  <label key={field} className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">{label}</span>
                    <input
                      type={type}
                      value={contactForm[field]}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="border border-[#e5e0d8] rounded-md px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                    />
                  </label>
                ))}
                {contactMessage && (
                  <p className={`text-sm font-haas ${contactMessage.includes('success') ? 'text-[#2a7a4a]' : 'text-[#D04444]'}`}>
                    {contactMessage}
                  </p>
                )}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={contactSaving}
                    className="w-full bg-[#172338] text-white text-xs tracking-[0.14em] uppercase py-3.5 rounded-md disabled:opacity-50 hover:bg-[#1e2e4a] transition"
                  >
                    {contactSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] underline text-center">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activePanel === 'password' && (
              <form className="flex flex-col gap-5" onSubmit={handlePasswordSubmit}>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">New Password</span>
                  <input
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="border border-[#e5e0d8] rounded-md px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-medium">Confirm Password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="border border-[#e5e0d8] rounded-md px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                {passwordError && <p className="text-sm text-[#D04444] font-haas">{passwordError}</p>}
                {passwordMessage && <p className="text-sm text-[#2a7a4a] font-haas">{passwordMessage}</p>}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full bg-[#172338] text-white text-xs tracking-[0.14em] uppercase py-3.5 rounded-md disabled:opacity-50 hover:bg-[#1e2e4a] transition"
                  >
                    {passwordSaving ? 'Saving...' : 'Update Password'}
                  </button>
                  <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] underline text-center">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </>
    )
  }
```

- [ ] **Step 3: Commit**

```bash
git add components/myProfilePage.tsx
git commit -m "ui: add ProfileField helper and renderSlidePanel overlay"
```

---

### Task 5: Nuevo layout principal (header + tabs + contenido)

**Files:**
- Modify: `components/myProfilePage.tsx` (el `return (...)` de `MyProfilePage`)

- [ ] **Step 1: Eliminar constantes del sidebar antiguo**

Buscar y eliminar estas dos constantes (alrededor de línea 1630):
```typescript
  const navItemButtonClass =
    'relative w-full min-h-[52px] flex items-center justify-start border-b border-[#E9D9C2] py-3.5 sm:py-4 text-left'

  const navLinkLabelClass = (tab: ProfileNavTab) =>
    `font-gtsuper-ds font-medium text-sm sm:text-[15px] leading-snug tracking-wide ${selectedTab === tab ? 'text-primary' : 'text-[#172338]'}`
```

- [ ] **Step 2: Reemplazar el return completo**

Encontrar el `return (` del componente (alrededor de línea 1636) y reemplazar el bloque entero hasta el cierre del componente:
```tsx
  return (
    <div className="w-full max-w-[1920px] mx-auto flex flex-col min-h-0">
      {/* ── Banner Header ── */}
      <div className="bg-gradient-to-r from-[#172338] to-[#223358] px-5 sm:px-8 lg:px-12 py-5 sm:py-6 flex items-center gap-4">
        <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-[#D99330] to-[#f0c060] flex items-center justify-center text-white text-base font-bold shadow-[0_3px_12px_rgba(217,147,48,0.4)] shrink-0 select-none">
          {[profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || (user?.email?.[0] ?? '?').toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-white font-semibold text-[15px] leading-tight truncate">
            {fullName !== 'Not provided' ? fullName : (profile?.email || user?.email || '')}
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-[#f0c060] text-[10px] px-2 py-0.5 rounded-full border border-[rgba(217,147,48,0.4)] bg-[rgba(217,147,48,0.15)] self-start">
            ✦ Member
          </span>
        </div>
        <button
          type="button"
          className="ml-auto text-white/40 text-xs underline underline-offset-4 hover:text-white/70 transition shrink-0"
          onClick={logout}
        >
          Log out
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-[#172338] flex px-5 sm:px-8 lg:px-12 overflow-x-auto">
        {PROFILE_NAV_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`py-3 px-4 text-[11px] uppercase tracking-[0.12em] border-b-2 whitespace-nowrap transition-colors ${
              selectedTab === tab
                ? 'text-[#D99330] border-[#D99330]'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab === 'profile' ? 'My Profile' : tab === 'favorites' ? 'My Favorites' : 'My Trips'}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 bg-[#f5f3ef] px-5 sm:px-8 lg:px-12 py-8 sm:py-10 min-w-0">
        {renderCurrentSection()}
      </div>

      {/* ── Slide Panel ── */}
      {renderSlidePanel()}
    </div>
  )
```

- [ ] **Step 3: Verificar compilación**

```bash
npm run dev
```
Esperado: página carga con el nuevo banner oscuro + tabs doradas. La tab activa muestra el contenido de la sección actual.

- [ ] **Step 4: Commit**

```bash
git add components/myProfilePage.tsx
git commit -m "ui: replace sidebar layout with top-tabs dark banner header"
```

---

### Task 6: Rediseñar `renderProfileSection`

**Files:**
- Modify: `components/myProfilePage.tsx` (`renderProfileSection`, líneas ~1064–1331)

- [ ] **Step 1: Reemplazar `renderProfileSection` completo**

Encontrar la función entera (`const renderProfileSection = () => {` hasta su `}` de cierre) y reemplazarla:

```tsx
  const renderProfileSection = () => {
    if (profileLoading) return <ProfileSectionSkeleton />
    if (profileError) return <p className="font-haas text-[#D04444]">{profileError}</p>

    return (
      <div className="flex flex-col gap-5 w-full">
        {/* Fila 1: Personal + Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Personal Info Card */}
          <div className="bg-white rounded-[10px] shadow-[0_1px_6px_rgba(0,0,0,0.06)] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-[#9a8f80] font-medium">Personal Info</h3>
              <button
                type="button"
                onClick={() => { syncProfileFormOnly(); setActivePanel('personal') }}
                className="border border-[#D99330] text-[#D99330] rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.06em] hover:bg-[#fdf6e8] transition"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <ProfileField label="First Name" value={profile?.firstName || user?.firstName} />
              <ProfileField label="Last Name" value={profile?.lastName || user?.lastName} />
              <ProfileField label="Birthday" value={birthday !== 'Not provided' ? birthday : null} />
              <ProfileField label="Nationality" value={nationality !== 'Not provided' ? nationality : null} />
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-[10px] shadow-[0_1px_6px_rgba(0,0,0,0.06)] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-[#9a8f80] font-medium">Contact Details</h3>
              <button
                type="button"
                onClick={() => { syncContactFormOnly(); setActivePanel('contact') }}
                className="border border-[#D99330] text-[#D99330] rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.06em] hover:bg-[#fdf6e8] transition"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <ProfileField label="Email" value={email !== 'Not provided' ? email : null} />
              <ProfileField label="Mobile Phone" value={phoneNumber !== 'Not provided' ? phoneNumber : null} />
              <ProfileField label="Address" value={address !== 'Not provided' ? address : null} />
              <ProfileField label="City" value={city !== 'Not provided' ? city : null} />
              <ProfileField label="Postal Code" value={postalCode !== 'Not provided' ? postalCode : null} />
            </div>
          </div>
        </div>

        {/* Fila 2: Security Card (ancho completo) */}
        <div className="bg-white rounded-[10px] shadow-[0_1px_6px_rgba(0,0,0,0.06)] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-[#9a8f80] font-medium mb-2">Security</h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80]">Password</span>
                <span className="text-sm text-[#172338] font-medium tracking-widest">••••••••</span>
              </div>
              {passwordMessage && !activePanel && (
                <p className="text-sm text-[#2a7a4a] font-haas mt-2">{passwordMessage}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setPasswordForm({ newPassword: '', confirmPassword: '' })
                setPasswordError(null)
                setPasswordMessage(null)
                setActivePanel('password')
              }}
              className="border border-[#D99330] text-[#D99330] rounded-md px-3 py-1 text-[11px] uppercase tracking-[0.06em] hover:bg-[#fdf6e8] transition shrink-0"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    )
  }
```

- [ ] **Step 2: Verificar que las variables de display existen**

Las variables `birthday`, `nationality`, `address`, `city`, `postalCode`, `email`, `phoneNumber` están definidas alrededor de línea 1038–1053. No requieren cambio.

- [ ] **Step 3: Probar tab My Profile**

```bash
npm run dev
```
Verificar:
- Dos cards en fila superior (Personal Info + Contact Details)
- Card de Security ancho completo debajo
- Botón "Edit" en Personal abre slide panel con los campos correctos
- Botón "Edit" en Contact abre el panel de contacto
- "Change Password" abre el panel de password
- Panel se cierra con X o click en overlay
- Guardar cierra el panel y muestra mensaje de éxito en la card Security

- [ ] **Step 4: Commit**

```bash
git add components/myProfilePage.tsx
git commit -m "ui: redesign profile tab with three-card layout and slide panel wiring"
```

---

### Task 7: Rediseñar cards de favoritos y empty states

**Files:**
- Modify: `components/myProfilePage.tsx` (`renderFavoritesSection` y `renderTripsSection`)

- [ ] **Step 1: Actualizar header de sección en `renderFavoritesSection`**

Buscar el bloque del header de favoritos (alrededor de línea 1378):
```tsx
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="font-gtsuper-ds font-light text-xl">MY FAVORITES ({sortedFavoriteRows.length})</h1>
          <label className="flex items-center gap-3 text-sm font-haas text-[#506A70]">
            Sort by
            <select
              value={favoritesSort}
              onChange={(event) => setFavoritesSort(event.target.value as 'recent' | 'alphabetical')}
              className="border border-[#E5E7EB] px-3 py-2 text-[#172338] bg-white"
            >
              <option value="recent">Recent</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </div>
```
Reemplazar con:
```tsx
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="font-gtsuper-ds font-light text-xl tracking-wide text-[#172338]">
            MY FAVORITES <span className="text-[#D99330]">({sortedFavoriteRows.length})</span>
          </h2>
          <label className="flex items-center gap-2 text-xs font-haas text-[#9a8f80] uppercase tracking-[0.08em]">
            Sort by
            <select
              value={favoritesSort}
              onChange={(e) => setFavoritesSort(e.target.value as 'recent' | 'alphabetical')}
              className="border border-[#e5e0d8] rounded-md px-3 py-2 text-[#172338] bg-white text-xs normal-case tracking-normal"
            >
              <option value="recent">Recent</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </div>
```

- [ ] **Step 2: Reemplazar card de villa rental**

Buscar el bloque del card rental (el que devuelve `ProfileFavoriteCardShell` cuando `favorite.rental` es true). Reemplazar el `return (...)` completo de ese bloque:
```tsx
                return (
                  <ProfileFavoriteCardShell
                    key={`p-${favorite.id}`}
                    onClick={() => onRentalFavoriteCardClick(favorite)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={heroSrc}
                        alt={favorite.title}
                        className="w-full h-52 object-cover transition-transform duration-300 hover:scale-[1.02]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src !== VILLA_LIST_PLACEHOLDER) target.src = VILLA_LIST_PLACEHOLDER
                        }}
                      />
                      <button
                        type="button"
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition disabled:opacity-70 shadow-sm"
                        onClick={(e) => { e.stopPropagation(); void handleToggleFavorite(favorite.id) }}
                        disabled={pendingFavoriteIds.has(favorite.id)}
                        aria-pressed
                        aria-label="Remove from favourites"
                      >
                        <Heart className="w-4 h-4 fill-[#ef4444] text-[#ef4444]" />
                      </button>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <h3 className="text-lg font-haas font-light text-[#506A70] mb-1 leading-snug">{favorite.title}</h3>
                      <div className="flex items-center gap-1 text-[#303D40] mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs">{villa?.visibleLocation || favorite.location || villa?.country || 'N/A'}</span>
                      </div>
                      <p className="text-[#B17520] font-medium font-haas text-xs mb-4">
                        {villa?.classification?.bedrooms ?? 'N/A'} Bedrooms · {getVillaGuestDisplay(villa)} Guests · {formatPoolsJacuzziSpecLine(villa?.classification)}
                      </p>
                      <div className="mt-auto flex items-center gap-1.5 font-haas text-sm text-[#172338] font-semibold">
                        <ChevronRight className="w-3.5 h-3.5 text-[#D99330]" />
                        {getRentalListDisplayPrice(villa)}
                      </div>
                    </div>
                  </ProfileFavoriteCardShell>
                )
```

- [ ] **Step 3: Reemplazar card de real estate**

Buscar el `return (...)` del bloque de real estate (inmediatamente después del bloque rental) y reemplazarlo:
```tsx
              return (
                <ProfileFavoriteCardShell
                  key={`p-${favorite.id}`}
                  onClick={() => onRealEstateFavoriteCardClick(favorite)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={saleHeroSrc}
                      alt={favorite.title}
                      className="h-52 w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (!target.src.includes('villa-placeholder')) target.src = DEFAULT_VILLA_IMAGE
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition disabled:opacity-70 shadow-sm"
                      onClick={(e) => { e.stopPropagation(); void handleToggleFavorite(favorite.id) }}
                      disabled={pendingFavoriteIds.has(favorite.id)}
                      aria-pressed
                      aria-label="Remove from favourites"
                    >
                      <Heart className="h-4 w-4 fill-[#ef4444] text-[#ef4444]" />
                    </button>
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-lg font-haas font-light text-[#506A70] mb-1 leading-snug">{favorite.title}</h3>
                    <div className="flex items-center gap-1 text-[#303D40] mb-3">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs">{favorite.location || 'N/A'}</span>
                    </div>
                    <p className="text-[#B17520] font-medium font-haas text-xs mb-4">
                      {saleBedrooms} Bedrooms · {formatPoolsJacuzziSpecLine(raw?.classification)}
                    </p>
                    <div className="mt-auto flex items-center gap-2 font-haas text-sm text-[#172338] font-semibold">
                      <EuroIcon className="h-3.5 w-3.5 shrink-0 text-[#D99330]" />
                      {salePriceLabel}
                    </div>
                  </div>
                </ProfileFavoriteCardShell>
              )
```

- [ ] **Step 4: Actualizar empty state de Favorites**

Buscar el return del empty state de favoritos (bloque que empieza con `<div className="flex flex-col items-start gap-4 max-w-lg">`). Reemplazarlo:
```tsx
    return (
      <div className="flex flex-col items-start gap-6 max-w-lg py-6">
        <div>
          <h2 className="font-gtsuper-ds font-light text-xl uppercase text-[#172338] tracking-wide mb-3">
            My Favorites
          </h2>
          <p className="font-haas font-light text-sm text-[#506A70] leading-relaxed">
            You haven&apos;t saved anything yet. Use the heart icon on villas, real estate listings,
            concierge services, or events to save them here.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Link href="/villas/list" className="font-haas text-sm text-[#D99330] underline underline-offset-4 hover:opacity-80">
            Browse villa rentals
          </Link>
          <Link href="/concierge/list" className="font-haas text-sm text-[#D99330] underline underline-offset-4 hover:opacity-80">
            Browse concierge services
          </Link>
          <Link href="/events/list" className="font-haas text-sm text-[#D99330] underline underline-offset-4 hover:opacity-80">
            Browse events
          </Link>
        </div>
      </div>
    )
```

- [ ] **Step 5: Reemplazar `renderTripsSection` completo**

```tsx
  const renderTripsSection = () => {
    if (tripsLoading) return <TripsSectionSkeleton />

    return (
      <div className="flex flex-col items-start gap-6 max-w-lg py-6">
        <div>
          <h2 className="font-gtsuper-ds font-light text-xl uppercase text-[#172338] tracking-wide mb-3">
            My Trips
          </h2>
          <p className="font-haas font-light text-sm text-[#506A70] leading-relaxed">
            You don&apos;t have any upcoming trips yet. When you book with us, your itineraries will appear here.
          </p>
        </div>
        <Link
          href="/villas/list"
          className="font-haas text-sm text-[#D99330] underline underline-offset-4 hover:opacity-80"
        >
          Explore stays
        </Link>
      </div>
    )
  }
```

- [ ] **Step 6: Build check final**

```bash
npm run build
```
Esperado: build sin errores. Warnings sobre tipos `any` son pre-existentes y se ignoran.

- [ ] **Step 7: Verificación visual completa**

```bash
npm run dev
```
Recorrer el flujo completo:
- [ ] Header: iniciales en avatar dorado, nombre, badge "Member", Log out visible
- [ ] Tabs: MY PROFILE / MY FAVORITES / MY TRIPS cambian contenido correctamente
- [ ] Profile tab: dos cards arriba + Security card abajo
- [ ] Click "Edit" en Personal → slide panel con 4 campos, guardar cierra el panel
- [ ] Click "Edit" en Contact → slide panel con 5 campos, guardar cierra el panel
- [ ] Click "Change Password" → slide panel con 2 campos de password
- [ ] Click en overlay oscuro → cierra el panel
- [ ] Favorites: cards sin borde, con sombra, imagen con hover zoom
- [ ] Trips: empty state limpio con link "Explore stays"
- [ ] Mobile (< 640px): tabs con scroll horizontal, slide panel ocupa 100% del ancho

- [ ] **Step 8: Commit final**

```bash
git add components/myProfilePage.tsx
git commit -m "ui: redesign favorites cards, empty states and trips tab"
```
