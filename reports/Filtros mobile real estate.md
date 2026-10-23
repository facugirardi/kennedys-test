# Filtros en móvil — /real-estate/list

Investigación del 2026-10-21. Método: navegación real en Chrome con la ventana a 354 × 714 px (viewport tipo teléfono chico) sobre 9 sitios, más una medición del DOM propio y búsqueda de guías de UX.

## 1. Diagnóstico del estado actual

Medido con JS en `/real-estate/list?region=Paros`, viewport 354 × 714:

| Elemento | Posición | Alto |
|---|---|---|
| Navbar del sitio | `fixed top-0` | 89 px |
| Bloque de filtros (colapsado: ubicación + "More filters") | `sticky` | 106 px |
| Botón flotante "Contact Our Agent" | `fixed` abajo a la derecha | 52 px |

- **Lo fijo ocupa 195 px de 714 (27 %)** antes de ver una sola tarjeta. El botón flotante tapa además el pie de cada tarjeta.
- **Expandido ("More filters") el bloque mide unos 370 px**: ubicación, precio, bedrooms, sort, Filters y Check Now apilados, uno por fila. Al estar `sticky`, si el usuario lo abre y hace scroll, esa columna sigue encima de las fichas.
- **Dos puertas a los filtros** que no se conectan: los 5 controles de la barra y el overlay "Filters". Para filtrar por precio y bedrooms hay dos lugares distintos.
- **Bug del overlay en teléfonos angostos**: el panel es `fixed ... w-96` (384 px). En un viewport de 354 px (también 360 y 375, que son comunes) queda cortado a la derecha: se pierde parte de Max Price, de "Apartment Floor" y del botón "See results". Solo cabe en pantallas ≥ 384 px.
- El selector de Sort y el de bedrooms de la barra aplican solos a los 600 ms, y "Check Now" aplica explícitamente. Hay dos modelos de aplicación mezclados.

## 2. Qué hace cada sitio en móvil

| Sitio | Qué queda fijo al hacer scroll | Cómo se abren los filtros | Pie del panel |
|---|---|---|---|
| **JamesEdition** | Una fila: "Save search" + "Filters". Pill flotante "Show map" abajo al centro. | Panel de pantalla completa | "Clear all" + botón negro con **contador en vivo** ("Show 500+ homes"), siempre visible |
| **Zillow** | Fila de chips (For sale ▾ · Filters ▾ · Save search). El buscador y el título scrollean y se van. Pill flotante "Map \| Sort". Barra inferior de apps. | Modal de pantalla completa con "6,702 Results" arriba | "Reset all filters" + "Apply" |
| **Rightmove** | Buscador de ubicación + botón "Filters ▾" (muy bajo, ~50 px). Conteo, sort y mapa scrollean. | El panel se despliega bajo la barra fija, ocupa toda la pantalla, secciones colapsables | **Contador de resultados** + "Clear" + "Done" |
| **Airbnb** | Mapa primero; arriba: volver + píldora de búsqueda + icono de filtros; debajo, fila de **chips rápidos** que desliza en horizontal (Precio ▾, Wifi, Estacionamiento…). Lista en bottom sheet. | Hoja casi a pantalla completa, "Recomendaciones para vos" arriba | "Borrar todo" + "Mostrar más de 1000 alojamientos" (contador en el botón) |
| **Knight Frank** | Nada (solo el header). Buscador + un único icono de filtros con punto rojo si hay filtros activos. | Panel de pantalla completa | "Show Properties" + "Clear Filters" |
| **Sotheby's Intl.** | Fila de chips que desliza en horizontal (Buy/Rent · Price Range · Beds & Baths ›) queda fija bajo el header. Pills inferiores "Save Search" y "List". | Cada chip abre un **panel inline** (no pantalla completa) con slider y "Clear / Apply" | "Clear / Apply" dentro del panel |
| **Christie's Intl.** | Nada. Buscador, "List / Filters / ♡" y conteo + sort scrollean y se van. Mapa grande primero. | (No se abrió) | — |
| **Idealista** | No evaluado: muestra una verificación anti-bots y no la intenté saltar. | — | — |
| **Redfin** | No evaluado: misma verificación anti-bots. | — | — |
| **Engel & Völkers** | No evaluado: la URL del listado dio 404 y no encontré el path correcto. | — | — |

### Patrones que se repiten

1. **Casi nadie deja fijo un formulario de varios campos.** Lo que queda fijo, cuando algo queda, es una sola fila de una altura (≈ 40–60 px) con un botón "Filters" y, a lo sumo, 1–2 chips o "Save search". Los campos viven dentro del panel.
2. **El panel es de pantalla completa** (JamesEdition, Zillow, Rightmove, Knight Frank, Airbnb), salvo Sotheby's, que usa paneles inline por chip.
3. **El pie del panel siempre es fijo** y combina una acción destructiva suave a la izquierda (Clear all / Reset) con la acción principal a la derecha o a todo el ancho.
4. **El contador de resultados está en el botón principal o encima** (JamesEdition, Airbnb, Rightmove, Zillow). El usuario sabe cuántos resultados tendrá antes de aplicar.
5. **Hay un indicador de filtros activos**: Knight Frank pone un punto rojo en el icono; Zillow marca el chip activo; Rightmove muestra el conteo; Sotheby's resalta el chip.
6. **Controles segmentados para valores discretos** (Bedrooms Any / 1+ / 2+ / 3+ / 4+ / 5+ en JamesEdition, Zillow y Knight Frank), con "Use exact match" como casilla. Para precio, dos selects o slider + inputs Min/Max (Zillow suma histograma).
7. **Mapa y orden como acciones flotantes** abajo (Zillow "Map | Sort", JamesEdition "Show map", Sotheby's "Save search | List") en vez de ocupar la barra de arriba.
8. **Header que se esconde**: en JamesEdition y Zillow el buscador/título scrollean y solo queda la barra de filtros; Christie's y Knight Frank no dejan nada.

## 3. Evidencia de UX (qué se pudo y qué no se pudo verificar)

- [Baymard — Apply buttons in mobile filtering interfaces](https://baymard.com/guidelines/1125-apply-buttons-in-mobile-filtering-interfaces): la guía existe, pero la página no mostró el cuerpo al buscarla; la leí solo por resumen. Su punto central: si los filtros se aplican solos, el usuario que quiere elegir varias opciones sufre. Por eso un botón "Apply" explícito en móvil.
- [Baymard — Filtering options (mobile benchmark)](https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/filtering-options): los filtros en móvil suelen vivir en una interfaz aparte, y un problema frecuente son los viajes repetidos entre la lista y el filtro.
- [NN/g — Sticky headers](https://www.nngroup.com/articles/sticky-headers/): un header fijo "regala" espacio en cada pantalla; hay que evaluar si lo que contiene se usa seguido. Varias cifras que circulan en blogs (22 % menos de tiempo, 10 % de la altura) no pude confirmarlas en la fuente: no las uso.
- [Eleken — Bottom sheet UI](https://www.eleken.co/blog-posts/bottom-sheet-ui) y [SAP Fiori](https://experience.sap.com/fiori-design-android/?p=10902): hoja o bottom sheet para tareas cortas de filtrado donde el fondo sigue siendo relevante; pantalla completa cuando el set de filtros es grande. Es consenso de blogs y guías de diseño, no un estudio.
- [Contentsquare — Mobile filter UX](https://contentsquare.com/blog/mobile-filter-ux/): recomienda un menú de filtros accesible sin volver arriba. Es un blog de proveedor; lo trato como opinión.

Conclusión de la evidencia: apoya "un solo punto de entrada, panel con acción explícita al pie", pero **no hay un estudio concluyente sobre cuánta altura puede ocupar lo fijo**. La referencia práctica son los sitios de la sección 2: todos usan una fila, de 40–60 px.

## 4. Opciones de diseño para Kennedy's

### A. Una sola fila fija + panel de pantalla completa (recomendada)
- Fila fija bajo el navbar, de unos 52 px: `[ 📍 Paros ▾ ] [ ⚙ Filters (2) ]`. Opcional: chip de Sort.
- Todo el resto (precio, bedrooms, pisos, tipo, orden) vive en el panel de pantalla completa, con secciones y el pie fijo `Clear all | Show 35 homes`.
- Sin "Check Now" ni autoaplicado en móvil: se aplica con el botón del pie.
- Fija ≈ 89 + 52 = 141 px (20 %) en vez de 195 (27 %); y desaparece el modo expandido de 370 px.
- Se parece a JamesEdition (el modelo de la ficha que ya se copió) y a Zillow.

### B. Fila de chips deslizable estilo Sotheby's/Airbnb
- Una fila horizontal: `Location · Price ▾ · Beds ▾ · Sort ▾ · Filters`. Cada chip abre un panel inline.
- Ventaja: filtros más usados en un solo toque, sin abrir el panel.
- Costo: hay que diseñar y mantener 4–5 paneles pequeños; en 354 px los chips se cortan y exigen scroll horizontal.

### C. Nada fijo, filtros arriba, botón flotante (Christie's/Knight Frank)
- Los filtros scrollean con la página; abajo flota una píldora `Filters (2)`.
- Máximo espacio para las fichas, pero hay que volver arriba o usar el flotante para cambiar algo, y ya hay un flotante de "Contact Our Agent" que compite con ese lugar.

### Cosas a decidir sin importar la opción
- **Quitar o mover "Contact Our Agent"** de esta página en móvil, o subirlo para que no tape el pie de la tarjeta (ocupa 52 px abajo a la derecha).
- **Arreglar el ancho del panel**: `w-96` → `w-full` en móvil (`w-full md:w-96`) y `max-w` en escritorio.
- **Contador en vivo en el botón del pie** ("Show 35 homes"). Requiere pedir el conteo a la API con los filtros pendientes (hoy solo hay conteo tras aplicar); alternativa más barata: mostrar el conteo actual y actualizarlo al cerrar.
- **Indicador de filtros activos** en el botón (número o punto), porque el usuario ya no verá la barra con los valores.
- **Mapa**: hoy es un botón "Map view" dentro de la página. En móvil conviene una píldora flotante como en Zillow/JamesEdition (tiene sentido solo si se decide la opción A).

## 5. Recomendación

**Opción A.** Es la que mejor combina el impacto en espacio (se recupera ~55 px fijos y desaparece el bloque expandido), el parecido con los dos sitios más cercanos al producto (JamesEdition, Zillow) y el menor costo de implementación: el overlay ya existe y tiene el pie con "Clear All" y "See results"; hay que unificar la barra en una sola fila, arreglar el ancho y sumar el contador y el indicador de activos.

Pasos sugeridos, en orden:
1. Arreglar `w-96` para que el overlay no se corte en teléfonos (bug independiente, rápido).
2. Reemplazar el bloque `sticky` de 5 campos por la fila `Ubicación + Filters (n)` en móvil.
3. Mover precio, bedrooms y sort al panel; pie con `Clear all` + `Show N homes`.
4. Decidir qué hacer con "Contact Our Agent" y con el botón de mapa.

## 6. Límites de esta investigación

- Se midió un solo ancho (354 px). Falta ver 390/430 px y tablet (768 px), donde el overlay de 384 px sí cabe.
- No se probó con un teléfono real ni con eventos táctiles; el redimensionado de ventana no reproduce la barra del navegador móvil que sube y baja.
- Redfin e Idealista pidieron verificación anti-bots y quedaron fuera; Engel & Völkers y Christie's (panel de filtros) no se evaluaron.
- Las evidencias de Baymard y NN/g se leyeron por resumen de búsqueda, no las páginas completas.
