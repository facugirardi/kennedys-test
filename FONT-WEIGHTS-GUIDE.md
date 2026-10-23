# Guía de Uso de Fuentes - Pesos Correctos

## 🎨 Cómo Usar los Diferentes Pesos de Fuente

### **GT Super Ds Trial (font-gtsuper-ds):**

```tsx
// Regular (400) - Peso normal
<h1 className="font-gtsuper-ds font-normal text-6xl">
  Título Normal
</h1>

// Light (300) - Peso ligero ✅
<h1 className="font-gtsuper-ds font-light text-6xl">
  Título Ligero
</h1>

// Medium (500) - Peso medio
<h1 className="font-gtsuper-ds font-medium text-6xl">
  Título Medio
</h1>

// Bold (700) - Peso negrita
<h1 className="font-gtsuper-ds font-bold text-6xl">
  Título Negrita
</h1>
```

### **Neue Haas Grotesk Display Pro (font-haas):**

```tsx
// Regular (400) - Peso normal
<p className="font-haas font-normal text-lg">
  Texto Normal
</p>

// Light (300) - Peso ligero ✅
<p className="font-haas font-light text-lg">
  Texto Ligero
</p>

// Medium (500) - Peso medio
<p className="font-haas font-medium text-lg">
  Texto Medio
</p>

// Bold (700) - Peso negrita
<p className="font-haas font-bold text-lg">
  Texto Negrita
</p>
```

## 🔧 Solución para el Problema de Light

Si la fuente Light no se ve, asegúrate de usar:

```tsx
// ✅ CORRECTO - Para fuente Light
<h1 className="font-gtsuper-ds font-light text-6xl">
  Título con fuente Light
</h1>

// ❌ INCORRECTO - Esto usa el peso por defecto (400)
<h1 className="font-gtsuper-ds text-6xl">
  Título sin especificar peso
</h1>
```

## 📝 Ejemplo Completo

```tsx
<div className="hero-section">
  {/* Título principal con fuente Light */}
  <h1 className="font-gtsuper-ds font-light text-6xl uppercase text-white">
    Discover Your Next Adventure
  </h1>
  
  {/* Subtítulo con fuente Light */}
  <h2 className="font-gtsuper font-light text-3xl uppercase text-primary">
    Luxury Villa and Chalet Rental
  </h2>
  
  {/* Texto de cuerpo con fuente Light */}
  <p className="font-haas font-light text-lg leading-7 text-gray-700">
    Providing curated accommodations and personalized services...
  </p>
</div>
```

## 🎯 Clases de Peso Disponibles

- `font-thin` (100) - Muy ligero
- `font-extralight` (200) - Extra ligero  
- `font-light` (300) - Ligero ✅ **USA ESTA PARA LIGHT**
- `font-normal` (400) - Normal
- `font-medium` (500) - Medio
- `font-semibold` (600) - Semi-negrita
- `font-bold` (700) - Negrita
- `font-extrabold` (800) - Extra negrita
- `font-black` (900) - Muy negrita

