# Guía de Uso de Fuentes en Tailwind CSS - Kennedys Web

## Fuentes Disponibles y Cómo Usarlas

### 1. **GT Super Ds Trial** 
- **Clase Tailwind**: `font-gtsuper-ds`
- **Variable CSS**: `--font-gt-super-ds-trial`
- **Uso recomendado**: Títulos principales, headlines grandes
- **Ejemplo**:
```tsx
<h1 className="font-gtsuper-ds text-6xl font-light uppercase">
  Discover Your Next Adventure
</h1>
```

### 2. **Neue Haas Grotesk Display Pro**
- **Clase Tailwind**: `font-haas`
- **Variable CSS**: `--font-neue-haas-grotesk-display-pro`
- **Uso recomendado**: Texto de cuerpo, descripciones, contenido general
- **Ejemplo**:
```tsx
<p className="font-haas text-base leading-6 text-gray-700">
  Descripción del contenido con Neue Haas Grotesk Display Pro
</p>
```

### 3. **GT Super Txt Trial** (Existente)
- **Clase Tailwind**: `font-gtsuper`
- **Variable CSS**: `--font-gt-super-txt-trial`
- **Uso recomendado**: Subtítulos, títulos secundarios
- **Ejemplo**:
```tsx
<h2 className="font-gtsuper text-3xl font-light uppercase">
  Luxury Villa and Chalet Rental
</h2>
```

### 4. **GT Super Display** (Existente)
- **Clase Tailwind**: `font-gtsuper-display`
- **Variable CSS**: `--font-gt-super-display`
- **Uso recomendado**: Elementos de display muy grandes
- **Ejemplo**:
```tsx
<h1 className="font-gtsuper-display text-8xl font-light">
  GRAN TÍTULO
</h1>
```

## Ejemplos Prácticos de Uso

### Hero Section
```tsx
<div className="hero-section">
  <h1 className="font-gtsuper-ds text-5xl md:text-7xl font-light uppercase text-white">
    Discover your Next Adventure
  </h1>
  <p className="font-haas text-lg text-gray-300 mt-4">
    Experience luxury like never before
  </p>
</div>
```

### Card Component
```tsx
<div className="card">
  <h3 className="font-gtsuper text-2xl font-light uppercase text-primary">
    Luxury Experience
  </h3>
  <p className="font-haas text-base leading-6 text-gray-600 mt-3">
    Providing curated accommodations and personalized services for an unforgettable stay.
  </p>
</div>
```

### Navigation
```tsx
<nav className="navigation">
  <div className="font-gtsuper-ds text-xl font-light">Kennedys</div>
  <ul className="font-haas text-sm">
    <li>Vacation Rentals</li>
    <li>Concierge</li>
    <li>Real Estate</li>
  </ul>
</nav>
```

## Combinaciones Recomendadas

### Para Títulos Principales
```tsx
<h1 className="font-gtsuper-ds text-4xl md:text-6xl font-light uppercase text-primary">
```

### Para Subtítulos
```tsx
<h2 className="font-gtsuper text-2xl md:text-3xl font-light uppercase text-gray-800">
```

### Para Texto de Cuerpo
```tsx
<p className="font-haas text-base md:text-lg leading-6 text-gray-600">
```

### Para Texto Pequeño
```tsx
<span className="font-haas text-sm text-gray-500">
```

## Archivos de Fuente Requeridos

Asegúrate de tener estos archivos en `/public/`:
- `GT-Super-Ds-Trial.woff2`
- `Neue-Haas-Grotesk-Display-Pro.woff2`
- `GT-Super-Text-Regular.woff2` (ya existente)

## Notas Importantes

1. **Fallbacks**: Todas las fuentes tienen fallbacks configurados (`serif` o `sans-serif`)
2. **Pesos**: Las fuentes están configuradas con `font-weight: 300` y `font-weight: 400`
3. **Responsive**: Usa clases como `text-4xl md:text-6xl` para diferentes tamaños de pantalla
4. **Consistencia**: Mantén la jerarquía tipográfica usando las fuentes apropiadas para cada nivel

