# Login Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar `/login` con layout split 50/50 — imagen full-height izquierda, panel blanco con logo + form derecha.

**Architecture:** `RegisterForm` se despoja de su propio wrapper de dos columnas y pasa a renderizar solo el contenido del step activo. `pages/login.tsx` toma control del layout: imagen sticky izquierda, contenido centrado derecha con logo Kennedy's y tagline.

**Tech Stack:** Next.js 14 Pages Router, TypeScript, Tailwind CSS, fuente `font-haas`.

---

## File Map

| Archivo | Acción |
|---------|--------|
| `components/custom/RegisterForm.tsx` | Modificar — quitar outer grid + columna imagen |
| `pages/login.tsx` | Modificar — nuevo split layout |

---

## Task 1: Despojar RegisterForm de su layout propio

**Files:**
- Modify: `components/custom/RegisterForm.tsx`

El return actual de `RegisterForm` es un grid de dos columnas (imagen | contenido). Hay que quitarlo y devolver solo el contenido.

- [ ] **Step 1: Eliminar el import de `registerImage`**

Buscar y eliminar la línea:
```tsx
import registerImage from '@/public/images/register-image.png'
```

- [ ] **Step 2: Eliminar `isTallStep` (solo se usaba en el wrapper externo)**

Buscar y eliminar la línea:
```tsx
  const isTallStep = currentStep === 'registerDetails';
```

- [ ] **Step 3: Reemplazar el return completo**

El return actual empieza en la línea `return (` cerca del final (después de `renderStep()`). Reemplazar todo el bloque `return (...)` por:

```tsx
  return (
    <div className="relative w-full">
      {currentStep !== 'success' && (
        <button
          type='button'
          onClick={() => setShowRegisterForm(false)}
          className="absolute right-0 top-0 z-10 touch-manipulation text-gray-400 hover:text-gray-600"
          aria-label='Close'
        >
          <X size={20} />
        </button>
      )}
      {renderStep()}
    </div>
  );
```

- [ ] **Step 4: Eliminar `headerControlsYClass`** (ya no se usa)

Buscar y eliminar estas líneas:
```tsx
  /** Same vertical offset as ChevronLeft so the close (X) aligns on the form column. */
  const headerControlsYClass =
    currentStep === 'verification'
      ? 'top-8 sm:top-12 md:top-16'
      : 'top-6 sm:top-8 md:top-10';
```

- [ ] **Step 5: Verificar que no quedan referencias a `registerImage`, `isTallStep`, `headerControlsYClass`**

```bash
cd /Users/budi/Desktop/Proyectos/kennedys-web
grep -n "registerImage\|isTallStep\|headerControlsYClass" components/custom/RegisterForm.tsx
```
Esperado: sin output.

- [ ] **Step 6: Commit**

```bash
git add components/custom/RegisterForm.tsx
git commit -m "refactor: strip layout wrapper from RegisterForm"
```

---

## Task 2: Nuevo layout en `pages/login.tsx`

**Files:**
- Modify: `pages/login.tsx`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/components/custom/Navbar';
import { RegisterForm } from '@/components/custom/RegisterForm';
import registerImage from '@/public/images/register-image.png';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const raw = typeof router.query.returnTo === 'string' ? router.query.returnTo : '/';
  const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, loading, returnTo, router]);

  return (
    <>
      <Navbar textBlack />
      <div className="flex h-screen overflow-hidden">
        {/* Panel izquierdo: imagen */}
        <div className="hidden md:block md:w-1/2 relative flex-shrink-0">
          <img
            src={registerImage.src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Panel derecho: form */}
        <div className="w-full md:w-1/2 overflow-y-auto bg-white">
          <div className="min-h-full flex flex-col items-center justify-center px-8 sm:px-12 pt-28 pb-12">
            {/* Logo */}
            <img
              src="/images/capa-1-3.svg"
              alt="Kennedy's Group"
              className="h-7 mb-4"
            />
            {/* Tagline */}
            <p className="font-haas text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-10">
              Welcomes You
            </p>
            {/* Form */}
            <div className="w-full max-w-sm">
              <RegisterForm
                returnTo={returnTo}
                setShowRegisterForm={(open) => {
                  if (!open) {
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push('/');
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verificar en browser**

Con `npm run dev`, navegar a `http://localhost:3000/login`:
- Desktop: imagen ocupa el 50% izquierdo, form centrado a la derecha con logo y tagline
- Mobile: solo el panel derecho (imagen oculta con `hidden md:block`)
- El Navbar negro aparece sobre ambos paneles
- El botón X del form cierra y navega atrás
- Navegar por los steps (email → password / register → verify) — el contenido scrollea en el panel derecho si es necesario

- [ ] **Step 3: Commit**

```bash
git add pages/login.tsx
git commit -m "feat: redesign login page with split layout"
```
