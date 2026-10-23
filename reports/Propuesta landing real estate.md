# Propuesta de mejora — landing /real-estate

Fecha: 2026-10-21. Alcance acordado: solo la landing (`/real-estate`, `components/RealStatePage.tsx`). Restricción: **mantener el estilo actual** de Kennedy's. Esto es una evolución de estructura y jerarquía, no un cambio de identidad visual.

## 1. Qué se conserva (el ADN que no se toca)

| Elemento | Valor actual |
|---|---|
| Titulares | `font-gtsuper-ds` ligero (serif), en tinta `#172338` |
| Texto y UI | `font-haas` (grotesk) |
| Colores | tinta `#172338`, acento dorado `#D99330` / `#B17520`, gris azulado `#506A70`, fondos `#F5F8FE` y blanco, borde `#E2E8EB`, CTA turquesa `#28F6EA` |
| Forma | esquinas rectas, bordes finos, sin sombras fuertes, sin redondeos |
| Navbar, footer, botón "Contact Our Agent" | sin cambios |
| Tarjeta de propiedad | la que ya se rediseñó (`propertieCard.tsx`) |

No se agrega tipografía, paleta, animaciones de scroll (Lenis/GSAP) ni librerías nuevas.

## 2. Auditoría de la landing actual

Recorrida completa en escritorio (1470 px), de arriba hacia abajo:

1. **Hero:** foto a pantalla ancha con "REAL ESTATE" en serif blanco muy grande. Sin subtítulo, sin dato.
2. **Barra de búsqueda:** la misma de la lista, y **queda pegada arriba durante toda la landing**, tapando el contenido (se ve encima de las tarjetas, de los bloques de servicios y de las fotos de destino).
3. **"Properties you'll love"** (tarjetas).
4. **4 mosaicos de servicios** ("Top level commercial and residential real estate services", "Top quality hospitality…", etc.) con fotos de stock (un apretón de manos, una recepción genérica).
5. **"Trending Now"** (3 tarjetas) y **"New Properties"** (carrusel de 4): dos filas de tarjetas casi iguales seguidas.
6. **"Popular locations to invest in"**: 3 mosaicos de destino (Athens Riviera, Paros, Mykonos) con el nombre sobre la foto.
7. **"Top Networking" / "Premium Portfolio"**: texto que habla solo de Mykonos ("…throughout the Mykonos market…"), en una página que es de toda la sección.
8. **"Top Searches"**: otra vez Athens Riviera, Mykonos y Paros, con foto distinta.

Problemas, en orden de impacto:
- **La barra pegada** compite con todo el contenido y repite un patrón de la lista que no hace falta en una portada.
- **Destinos duplicados** (bloques 6 y 8 muestran los mismos tres lugares).
- **Dos filas de tarjetas parecidas** (bloque 5) sin una razón editorial clara de por qué una es "Trending" y la otra "New".
- **Mensaje centrado en Mykonos** en la sección que debería ser general.
- **Fotos de stock** en un sitio que vende casas reales: debilitan la credibilidad.
- **No hay ninguna invitación a vender** o a pedir una valoración, que es lo que casi todos los referentes ponen en primer plano.

## 3. Referencias vistas (capturas del 2026-10-21 + notas del 2026-10-20)

| Referencia | Qué se ve | Qué sirve para Kennedy's |
|---|---|---|
| **The Modern House** | Secciones por "colección" (Prime, New, Featured, Past sales), cada una con título centrado en versalitas, botón outline "View all" a la derecha, 3 tarjetas con nombre y lugar a la izquierda y precio a la derecha. Banda negra con cita de prensa y un solo botón "How much is my home worth?". Franja de "Sold". | Estructura por colecciones con encabezado fino y un "ver todo" outline. Banda de valoración. Se puede hacer con nuestros colores y tipografías. |
| **Greece Sotheby's** | Hero a pantalla completa con una tarjeta translúcida que presenta un desarrollo. Más abajo, un bloque "Property Search" de 3 selects + botón, flotando como tarjeta. Colecciones por destino. | Búsqueda como **tarjeta propia y puntual** en la portada, no como barra pegada. Hero que muestra una propiedad real. |
| **JamesEdition** | Hero con carrusel de fotos reales y pie de foto con ubicación y precio; "Featured categories" en mosaicos con contador de anuncios; "Trending" en carrusel. | Mosaicos de destino con **contador real** ("35 propiedades"), pie de foto con dato real. |
| **Knight Frank / Savills** | Portada como posicionamiento: bloques de servicios con texto, cifras, artículos. | Confirma que un bloque de servicios es normal, pero con **imagen propia**, no stock, y breve. |
| **E&V Grecia** | Guía de compra y reportes de mercado como contenido. | Como idea de contenido futura (Golden Visa), no para esta pasada. |

Hallazgo transversal: los sitios más cuidados **no repiten destinos, ordenan por colección con nombre propio y tienen una sola invitación a vender**. Los que más se parecen a un portal (varias filas de tarjetas, mucha búsqueda) son los que más se alejan de la sensación de lujo.

## 4. Propuesta, bloque por bloque

Todo con tipografías, colores y formas actuales.

| # | Hoy | Propuesta | Por qué | Referencia |
|---|---|---|---|---|
| 1 | Hero solo con título | Mismo hero y mismo título. Debajo, una línea fina con un dato real de la API ("35 propiedades · 9 destinos") si existe; si no, no se muestra. | Da contexto sin inventar números. | JamesEdition (contador), regla del proyecto: sin datos de relleno |
| 2 | Barra pegada en toda la página | Una sola tarjeta de búsqueda justo debajo del hero (blanca, borde fino, Location · Budget · Bedrooms · botón turquesa). **No pegajosa** en la landing. En móvil, ubicación + "Filters" (igual que la lista). | Quita el estorbo permanente; la búsqueda sigue siendo lo primero. | Greece Sotheby's |
| 3 | "Properties you'll love" + "Trending Now" + "New Properties" | Dos colecciones con encabezado al estilo TMH: **"Featured"** y **"New"**. Título serif a la izquierda, botón outline "View all" a la derecha, 3 o 4 tarjetas iguales a las de la lista. Se elimina la tercera fila. | Menos repetición, más claridad sobre qué es cada fila. | The Modern House |
| 4 | 4 mosaicos de servicios con fotos de stock | Una franja compacta de 3–4 columnas con icono lineal o número, un título en serif y una línea. Sin fotos de stock. Si el contenido viene del CMS, se respeta lo que cargue el CMS. | Quita lo que más resta credibilidad y deja el mensaje. | Knight Frank |
| 5 | "Popular locations" + "Top Searches" | **Un solo bloque "Destinations"** con los mosaicos actuales (foto + nombre en serif sobre la foto) y, debajo del nombre, el número de propiedades (dato real). Cada mosaico lleva a `/real-estate/<destino>`. | Elimina la duplicación. | JamesEdition, Greece Sotheby's |
| 6 | "Top Networking" / "Premium Portfolio" centrados en Mykonos | Mantener el layout imagen + texto, pero el texto se vuelve general (o se mueve a la página de destino Mykonos si debe seguir hablando solo de allí). Es una decisión de contenido, no de diseño. | La landing es de toda la sección. | — |
| 7 | (no existe) | **Banda de valoración:** fondo tinta `#172338`, una frase en serif y un botón outline "Sell with us" / "Get a valuation" que lleve a lo que ya existe en el navbar ("Sell with us"). | Es la palanca de captación de propietarios que usan casi todos. | The Modern House (banda negra), Savills, E&V |

Qué NO propongo en esta pasada: animaciones de entrada, parallax, carruseles nuevos, nuevas tipografías, fotos nuevas, la sección de "Alójate antes de comprar" (la idea del informe anterior, que sí vale como siguiente paso si se confirma el contenido).

## 5. Orden de implementación sugerido

1. Búsqueda (2) y unificar destinos (5): son los cambios de mayor impacto y menor riesgo.
2. Colecciones Featured/New (3).
3. Franja de servicios (4).
4. Banda de valoración (7).
5. Hero con dato (1) y texto de los bloques (6), que dependen de datos y contenido.

Se verifica cada paso en el navegador (escritorio y móvil) antes del siguiente.

## 6. Preguntas abiertas

- ¿Los mosaicos de servicios (bloque 4) vienen del CMS? Si sí, solo cambia la presentación; si no, hay que decidir el texto.
- ¿"Top Networking" / "Premium Portfolio" deben seguir hablando de Mykonos? ¿Se generalizan o se mudan a la página de ese destino?
- ¿Adónde debe llevar el botón de la banda de valoración? Hoy "Sell with us" está en el navbar.
- ¿Hay un conteo de propiedades por destino en la API? (hoy el mosaico de destino no lo muestra; el home tiene un endpoint de stats por ubicación que se puede reutilizar).

## 7. Límites

- Las capturas son de escritorio. No se evaluó la landing de los referentes en móvil.
- Los comentarios sobre intención de diseño de los referentes son interpretación mía a partir de lo que se ve.
- No se midió tráfico ni conversión: no hay datos para decir qué bloque funciona hoy.
