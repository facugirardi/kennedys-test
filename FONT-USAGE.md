# Guía de Uso de Fuentes - Kennedys Web

## Fuentes Disponibles

### GT Super Ds Trial
- **Clase CSS**: `font-gtsuper-ds`
- **Variable CSS**: `--font-gt-super-ds-trial`
- **Uso**: Para títulos principales y elementos destacados
- **Ejemplo**: `<h1 className="font-gtsuper-ds text-4xl">Título Principal</h1>`

### Neue Haas Grotesk Display Pro
- **Clase CSS**: `font-haas`
- **Variable CSS**: `--font-neue-haas-grotesk-display-pro`
- **Uso**: Para texto de cuerpo, descripciones y contenido general
- **Ejemplo**: `<p className="font-haas text-base">Texto descriptivo</p>`

### GT Super Txt Trial (Existente)
- **Clase CSS**: `font-gtsuper`
- **Variable CSS**: `--font-gt-super-txt-trial`
- **Uso**: Para títulos secundarios y elementos de texto
- **Ejemplo**: `<h2 className="font-gtsuper text-2xl">Subtítulo</h2>`

### GT Super Display (Existente)
- **Clase CSS**: `font-gtsuper-display`
- **Variable CSS**: `--font-gt-super-display`
- **Uso**: Para elementos de display grandes
- **Ejemplo**: `<h1 className="font-gtsuper-display text-6xl">Título Grande</h1>`

## Archivos de Fuente Requeridos

Para que las fuentes funcionen correctamente, asegúrate de tener estos archivos en la carpeta `public/`:

- `GT-Super-Ds-Trial.woff2`
- `Neue-Haas-Grotesk-Display-Pro.woff2`

## Configuración

Las fuentes están configuradas en:
- `pages/global.css` - Definiciones @font-face y variables CSS
- `tailwind.config.js` - Clases de Tailwind CSS

## Ejemplos de Uso

```tsx
// Título principal con GT Super Ds Trial
<h1 className="font-gtsuper-ds text-5xl font-light uppercase text-white">
  Discover your Next Adventure
</h1>

// Texto descriptivo con Neue Haas Grotesk Display Pro
<p className="font-haas text-[16px] leading-6 text-[#506A70]">
  Descripción del contenido
</p>

// Subtítulo con GT Super Txt Trial
<h2 className="font-gtsuper text-[40px] leading-[1.05] uppercase font-light">
  Luxury Villa and Chalet Rental
</h2>
```
