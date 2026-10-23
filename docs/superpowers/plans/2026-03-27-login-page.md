# Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el modal de login en una página `/login` con redirect `?returnTo=` al completar la autenticación.

**Architecture:** Se agrega `returnTo?: string` a `RegisterForm`, se crea `pages/login.tsx` que lo renderiza full-page, y todos los puntos de entrada que antes llamaban `openLoginModal()` pasan a `router.push('/login?returnTo=...')`. Se elimina `LoginContext`, `loginsignup.tsx` y `LoginProvider`.

**Tech Stack:** Next.js 14 Pages Router, TypeScript, React Hook Form, `useRouter` de `next/router`, `useAuth` de `@/src/contexts/AuthContext`.

---

## File Map

| Archivo | Acción |
|---------|--------|
| `components/custom/RegisterForm.tsx` | Modificar — agregar prop `returnTo` |
| `pages/login.tsx` | Crear |
| `components/custom/Navbar.tsx` | Modificar — quitar modal, botones → router.push |
| `components/ConciergeCard.tsx` | Modificar — reemplazar openLoginModal |
| `components/ConciergeDetailPage.tsx` | Modificar — reemplazar openLoginModal |
| `pages/villas/list/index.tsx` | Modificar — reemplazar openLoginModal |
| `pages/villas/index.tsx` | Modificar — reemplazar openLoginModal |
| `pages/index.tsx` | Modificar — reemplazar openLoginModal |
| `pages/villas/[id]/index.tsx` | Modificar — reemplazar openLoginModal |
| `pages/_app.tsx` | Modificar — quitar LoginProvider |
| `components/loginsignup.tsx` | Eliminar |
| `src/contexts/LoginContext.tsx` | Eliminar |

---

## Task 1: Agregar prop `returnTo` a RegisterForm

**Files:**
- Modify: `components/custom/RegisterForm.tsx`

- [ ] **Step 1: Actualizar Props interface (línea 23)**

Cambiar:
```tsx
interface Props {
  setShowRegisterForm: (show: boolean) => void;
}
```
Por:
```tsx
interface Props {
  setShowRegisterForm: (show: boolean) => void;
  returnTo?: string;
}
```

- [ ] **Step 2: Agregar `returnTo` al destructure del componente (línea 27)**

Cambiar:
```tsx
export const RegisterForm = ({ setShowRegisterForm }: Props) => {
```
Por:
```tsx
export const RegisterForm = ({ setShowRegisterForm, returnTo }: Props) => {
```

- [ ] **Step 3: Actualizar redirect en `handleLogin` (línea 250)**

Cambiar:
```tsx
    await userAuth.login(data.email, data.password as string);
    setShowRegisterForm(false);
    router.push('/my-profile');
```
Por:
```tsx
    await userAuth.login(data.email, data.password as string);
    setShowRegisterForm(false);
    router.push(returnTo || '/my-profile');
```

- [ ] **Step 4: Actualizar redirect en el step `success` (línea 554)**

Cambiar:
```tsx
      onClick={() => {
        setShowRegisterForm(false);
        if (userAuth.isAuthenticated) {
          router.push('/my-profile');
        }
      }}
```
Por:
```tsx
      onClick={() => {
        setShowRegisterForm(false);
        if (userAuth.isAuthenticated) {
          router.push(returnTo || '/my-profile');
        }
      }}
```

- [ ] **Step 5: Commit**

```bash
git add components/custom/RegisterForm.tsx
git commit -m "feat: add returnTo prop to RegisterForm"
```

---

## Task 2: Crear `pages/login.tsx`

**Files:**
- Create: `pages/login.tsx`

- [ ] **Step 1: Crear el archivo**

```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/components/custom/Navbar';
import { RegisterForm } from '@/components/custom/RegisterForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const raw = typeof router.query.returnTo === 'string' ? router.query.returnTo : '/';
  const returnTo = raw.startsWith('/') ? raw : '/';

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, returnTo, router]);

  return (
    <>
      <Navbar textBlack />
      <div className="flex min-h-screen items-center justify-center bg-white px-4 pt-28 pb-10">
        <div className="w-full max-w-[920px]">
          <RegisterForm
            returnTo={returnTo}
            setShowRegisterForm={(open) => {
              if (!open) router.back();
            }}
          />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verificar en browser**

Correr `npm run dev`. Navegar a `http://localhost:3000/login`.
- Debe verse el formulario de email centrado en página completa con Navbar negro arriba.
- El botón X debe navegar hacia atrás.
- Navegar a `http://localhost:3000/login?returnTo=/villas` — después de login debe redirigir a `/villas`.
- Si el usuario ya está autenticado, debe redirigir inmediatamente.

- [ ] **Step 3: Commit**

```bash
git add pages/login.tsx
git commit -m "feat: add /login page"
```

---

## Task 3: Limpiar Navbar

**Files:**
- Modify: `components/custom/Navbar.tsx`

- [ ] **Step 1: Eliminar imports de modal (líneas 4-5)**

Eliminar estas dos líneas:
```tsx
import Loginsignup from "../loginsignup"
import PortalPopup from "../portal-popup"
```

- [ ] **Step 2: Eliminar import de useLoginModal**

Cambiar:
```tsx
import { useLoginModal } from "@/src/contexts/LoginContext"
```
Eliminar esa línea completa.

- [ ] **Step 3: Eliminar destructure de useLoginModal y callbacks relacionados (líneas 25, 39-40)**

Eliminar estas 3 líneas:
```tsx
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useLoginModal();
```
```tsx
  const openLoginsignup = useCallback(() => openLoginModal(), [openLoginModal]);
  const closeLoginsignup = useCallback(() => closeLoginModal(), [closeLoginModal]);
```

- [ ] **Step 4: Eliminar el useEffect que cierra el menú móvil al abrir modal (líneas 54-56)**

Eliminar:
```tsx
  useEffect(() => {
    if (isLoginModalOpen) setMobileNavOpen(false);
  }, [isLoginModalOpen]);
```

- [ ] **Step 5: Actualizar botón "Log In" mobile (línea ~211)**

Cambiar:
```tsx
                      onClick={openLoginsignup}
```
Por:
```tsx
                      onClick={() => router.push('/login')}
```

- [ ] **Step 6: Actualizar botón "Log In" desktop (línea ~311)**

Cambiar:
```tsx
                    onClick={openLoginsignup}
```
Por:
```tsx
                    onClick={() => router.push('/login')}
```

- [ ] **Step 7: Eliminar el bloque PortalPopup/Loginsignup al final del return (líneas ~440-448)**

Eliminar:
```tsx
      {isLoginModalOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeLoginsignup}
        >
          <Loginsignup onClose={closeLoginsignup} />
        </PortalPopup>
      )}
```

- [ ] **Step 8: Verificar en browser**

- El botón "Log In" del Navbar desktop y mobile deben navegar a `/login`.
- No debe aparecer ningún modal.
- Asegurarse de que no hay errores de TypeScript en consola (`npm run build` o revisar la terminal del dev server).

- [ ] **Step 9: Commit**

```bash
git add components/custom/Navbar.tsx
git commit -m "feat: replace login modal with router.push in Navbar"
```

---

## Task 4: Actualizar componentes — ConciergeCard y ConciergeDetailPage

**Files:**
- Modify: `components/ConciergeCard.tsx`
- Modify: `components/ConciergeDetailPage.tsx`

> Ambos archivos ya tienen `useRouter` importado y `const router = useRouter()`.

### ConciergeCard.tsx

- [ ] **Step 1: Eliminar import de useLoginModal**

Encontrar y eliminar la línea:
```tsx
import { useLoginModal } from '@/src/contexts/LoginContext'
```
(o similar — buscar `useLoginModal` en los imports del archivo)

- [ ] **Step 2: Eliminar destructure de useLoginModal (línea ~46)**

Eliminar:
```tsx
  const { openLoginModal } = useLoginModal()
```

- [ ] **Step 3: Reemplazar llamada (línea ~85)**

Cambiar:
```tsx
                  openLoginModal()
```
Por:
```tsx
                  router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
```

### ConciergeDetailPage.tsx

- [ ] **Step 4: Eliminar import de useLoginModal**

Encontrar y eliminar la línea con `useLoginModal` en los imports.

- [ ] **Step 5: Eliminar destructure de useLoginModal (línea ~50)**

Eliminar:
```tsx
  const { openLoginModal } = useLoginModal()
```

- [ ] **Step 6: Reemplazar llamadas (líneas ~480 y ~888)**

Cada ocurrencia de `openLoginModal()` en este archivo:
```tsx
openLoginModal()
```
→
```tsx
router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
```

- [ ] **Step 7: Commit**

```bash
git add components/ConciergeCard.tsx components/ConciergeDetailPage.tsx
git commit -m "feat: replace openLoginModal with router.push in concierge components"
```

---

## Task 5: Actualizar páginas — villas/list, villas/index, index, villas/[id]

**Files:**
- Modify: `pages/villas/list/index.tsx`
- Modify: `pages/villas/index.tsx`
- Modify: `pages/index.tsx`
- Modify: `pages/villas/[id]/index.tsx`

> Todas estas páginas ya tienen `useRouter` y `router` disponibles.

El patrón a aplicar en cada archivo es el mismo:

1. Eliminar la línea de import de `useLoginModal` (o quitar `useLoginModal` del import si hay otros items)
2. Eliminar `const { openLoginModal } = useLoginModal()`
3. Reemplazar cada `openLoginModal()` por `router.push('/login?returnTo=' + encodeURIComponent(router.asPath))`

### pages/villas/list/index.tsx

- [ ] **Step 1: Quitar `useLoginModal` del import y del destructure (línea ~224)**

Eliminar la línea:
```tsx
    const { openLoginModal } = useLoginModal()
```
Y eliminar el import correspondiente de `useLoginModal`.

- [ ] **Step 2: Reemplazar la llamada (línea ~1853)**

```tsx
openLoginModal()
```
→
```tsx
router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
```

### pages/villas/index.tsx

- [ ] **Step 3: Quitar `useLoginModal` del import y del destructure (línea ~98)**

Eliminar:
```tsx
    const { openLoginModal } = useLoginModal();
```
Y el import correspondiente.

- [ ] **Step 4: Reemplazar las 4 llamadas (líneas ~464, ~538, ~594, ~810)**

Cada `openLoginModal()` → `router.push('/login?returnTo=' + encodeURIComponent(router.asPath))`

Nota: la línea ~810 es inline dentro de un callback:
```tsx
onToggleFavorite={property?.id ? () => { if (!isAuthenticated) { openLoginModal(); return; } toggleFavorite(property.id); } : undefined}
```
→
```tsx
onToggleFavorite={property?.id ? () => { if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return; } toggleFavorite(property.id); } : undefined}
```

### pages/index.tsx

- [ ] **Step 5: Quitar `useLoginModal` del import y del destructure (línea ~194)**

Eliminar:
```tsx
  const { openLoginModal } = useLoginModal();
```
Y el import correspondiente.

- [ ] **Step 6: Reemplazar la llamada (línea ~922)**

```tsx
openLoginModal()
```
→
```tsx
router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
```

### pages/villas/[id]/index.tsx

- [ ] **Step 7: Quitar `useLoginModal` del import y del destructure (línea ~627)**

Eliminar:
```tsx
  const { openLoginModal } = useLoginModal();
```
Y el import correspondiente.

- [ ] **Step 8: Reemplazar la llamada (línea ~637)**

```tsx
openLoginModal()
```
→
```tsx
router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
```

- [ ] **Step 9: Verificar build limpio**

```bash
npm run build
```
Esperado: sin errores de TypeScript ni imports no encontrados. Si hay warnings de `useLoginModal` no encontrado, significa que quedó alguna referencia — buscar con `grep -r "useLoginModal" .` y eliminar.

- [ ] **Step 10: Commit**

```bash
git add pages/villas/list/index.tsx pages/villas/index.tsx pages/index.tsx "pages/villas/[id]/index.tsx"
git commit -m "feat: replace openLoginModal with router.push in pages"
```

---

## Task 6: Cleanup — eliminar LoginContext, loginsignup y actualizar _app.tsx

**Files:**
- Delete: `src/contexts/LoginContext.tsx`
- Delete: `components/loginsignup.tsx`
- Modify: `pages/_app.tsx`

- [ ] **Step 1: Actualizar `pages/_app.tsx`**

Cambiar:
```tsx
import { LoginProvider } from "@/src/contexts/LoginContext"
```
Eliminar esa línea.

Cambiar el árbol de providers:
```tsx
      <AuthProvider>
        <LoginProvider>
          <ContactProvider>
            <Component {...pageProps} />
          </ContactProvider>
        </LoginProvider>
      </AuthProvider>
```
Por:
```tsx
      <AuthProvider>
        <ContactProvider>
          <Component {...pageProps} />
        </ContactProvider>
      </AuthProvider>
```

- [ ] **Step 2: Eliminar `src/contexts/LoginContext.tsx`**

```bash
rm src/contexts/LoginContext.tsx
```

- [ ] **Step 3: Eliminar `components/loginsignup.tsx`**

```bash
rm components/loginsignup.tsx
```

- [ ] **Step 4: Verificar build final**

```bash
npm run build
```
Esperado: build exitoso sin errores. Si aparece algún import de `LoginContext` o `loginsignup`, localizarlo con:
```bash
grep -r "LoginContext\|loginsignup" pages/ components/ src/ --include="*.tsx" --include="*.ts"
```
Y eliminarlo.

- [ ] **Step 5: Smoke test manual**

Con `npm run dev`:
1. Navbar: click "Log In" → navega a `/login` ✓
2. `/login`: completar login → redirige a `/my-profile` ✓
3. `/login?returnTo=/villas/123`: completar login → redirige a `/villas/123` ✓
4. `/login` estando ya autenticado → redirige inmediatamente ✓
5. `/villas`: click en favorito sin estar autenticado → navega a `/login?returnTo=/villas` ✓
6. X en `/login` → vuelve a la página anterior ✓

- [ ] **Step 6: Commit final**

```bash
git add pages/_app.tsx
git commit -m "feat: remove LoginContext and complete login page migration"
```
