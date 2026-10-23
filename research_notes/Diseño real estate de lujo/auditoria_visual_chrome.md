# Auditoría visual en Chrome (2026-10-20)

Método: navegación real en Chrome, capturas, hover sobre tarjetas, y script de auditoría que extrae fuentes computadas, colores, transiciones CSS, animaciones y librerías (GSAP, Lenis, Swiper, Webflow, Next, canvas/WebGL).

## JamesEdition (jamesedition.com)

**Stack / tokens**
- Fuentes: `heldane` (serif display, H1 68px w400, H2 34px w400) + `inter` (UI, ~90% de los nodos).
- Colores: negro #000 / #151515 texto, grises #717171 / #606060 secundarios, acento teal `rgb(0,108,117)` (#006C75) para links, botones "Send message", "Save search", "Log in".
- Fondos: blanco dominante, #E0E0E0 / #EFEFEF para bloques, banda de valoración en celeste muy suave.
- Transiciones: muy cortas y funcionales — `color .08s ease` (130 nodos), `opacity .2s linear`, `opacity .5s ease`, `transform .3s`. Animación `fade`. Sin GSAP, sin Lenis, sin video en la home, sin WebGL.

**Home**
- Header blanco/transparente sobre hero: burger + logo serif a la izquierda, "Sell With Us / For Agents / Log in" a la derecha (botón outline teal con radio pill). Segunda fila de categorías (Real Estate, Cars, Watches…).
- Hero: carrusel full-bleed de fotos de arquitectura, H1 serif blanco grande "The World's Luxury Marketplace", línea de prueba social en mayúsculas pequeñas con tracking ("ONE SEARCH • 810,000+ LISTINGS • 21,000+ TRUSTED SELLERS • 140 COUNTRIES"), indicador de slides con líneas finas + flechas, y pie de foto con ubicación y precio de la casa mostrada (abajo derecha).
- "Featured Categories": 4 tiles de imagen con overlay oscuro, contador "812,387 LISTINGS" en caps + flecha.
- "Trending": carrusel horizontal de 5 tarjetas con flechas circulares outline arriba a la derecha.
- "The Journal": 1 artículo grande con imagen + título serif blanco encima, y lista de 3 artículos a la derecha (thumb + fecha caps + título + extracto).
- Bloque Podcast con foto del host en círculo — gris #F4F4F4, CTA negro rectangular "LISTEN NOW →".

**Tarjeta de propiedad (home)**: foto 4:5 aprox, esquinas rectas, badges blancos arriba-izq ("Directly from developer", "New 7 days ago", "Video"), corazón en círculo blanco arriba-der. Debajo: precio (o "Price On Request") en peso medio + "Villa in Comporta, Setubal, Portugal" en gris. Sin beds/baths en la home.

**Listado (/real_estate/mykonos-greece)**
- Search pill central en el header ("Mykonos, Aegean, Greece" con ×).
- Barra de filtros horizontal con chips pill: "Filters" (negro relleno) · Type ▾ · Price ▾ · Beds ▾ · Amenities ▾ · New Builds · "Save search" (outline teal con icono). 
- Breadcrumb geográfico completo + H1 serif "Luxury Homes for Sale in Mykonos, Aegean, Greece" + "1,000+ listings" + "Sort: Premium ▾".
- Primer resultado "Promoted" en formato horizontal ancho: mosaico 1 foto grande + 2 pequeñas, panel derecho con precio grande, "5 Beds · 6 Baths · 180 Sqm", amenities con iconos (Garden, Pool, Fireplace, Water View, Outdoor Kitchen), extracto, logo agencia + nombre del agente con avatar, "Contact ✉".
- A la derecha, mapa estático de la isla con pins y botón "Show all results on map" — el mapa es una tarjeta más del grid, no split view.
- Resto: grid 3 columnas; foto con badges ("Video", "Virtual tour"), contador "1/30" abajo derecha, botón flotante "Show map" centrado en pantalla.
- Banner intercalado de valoración ("Know Your Property's True Worth" + "Get valuation").
- **Hover en tarjeta**: aparece flecha circular blanca para pasar fotos (carrusel en la tarjeta). Sin zoom de imagen.
- **Panel de filtros**: drawer lateral izquierdo, overlay oscuro sobre el resto; secciones Property type (checkbox + "All types ▾"), New developments, Price range (slider doble + inputs min/max), "Hide Price on Request listings", Living area… Footer fijo con "Clear all" + botón negro "Show 500+ homes" (contador en vivo). Chips de seleccionados arriba ("P.O.R. ×").

**Detalle**
- Barra superior: "← Back to search", breadcrumb, "Share" y "Save" a la derecha.
- Galería mosaico: 1 grande a la izquierda (~50%) + 4 en grilla 2×2, botón blanco "Show all photos".
- Precio grande + título serif + "4 Beds · 5 Baths · 160 Sqm · 2,000 Sqm lot" + ubicación link teal.
- Fila de "media tabs" con miniaturas: All Photos (75), Floor Plan, Video, Street View, Other.
- "About the Property" serif + texto truncado con "View more".
- Tabla de datos: Property type, Floors, Price/sqm, emisiones.
- Features con iconos en 2 columnas + "View all 18 features".
- "Explore the Area": mapa con radio aproximado (no ubicación exacta) + "View on Google Maps".
- **Sidebar sticky**: agente con avatar, rating, "Call Agent", formulario (nombre, email, teléfono con prefijo país, mensaje pre-rellenado), botón teal "Send message", checkboxes de alertas y términos.
- **Modal de registro** aparece al hacer scroll ("Trusted by the World's Leading Brokers", Google/Apple sign-in) — interrumpe la lectura; anti-patrón para lujo.
- Header colapsa a barra mínima al scrollear.

## The Modern House (themodernhouse.com)

**Stack / tokens**
- **Next.js + Tailwind** (clases `sticky top-0`, `lg:flex`, `z-[99]`; fuentes vía next/font con alias `sans`/`serif` y "sans Fallback") — el mismo stack que Kennedy's. Swiper para galerías.
- Dos familias: una sans geométrica (nav y labels en MAYÚSCULAS pequeñas con tracking amplio) y una serif (nombres de casas, citas, cuerpo editorial, itálica para citas de prensa).
- Paleta casi monocroma: negro #000 texto, blanco, y un **crema cálido `rgb(245,241,237)` (#F5F1ED)** para bloques editoriales y la ficha. Bandas negras para prensa/CTA.
- Motion mínimo: `color .5s cubic-bezier(.4,…)`, `opacity .5s`. Sin GSAP, sin Lenis, sin zoom en hover de imagen (el hover de la tarjeta no cambia nada visual salvo cursor). El lujo lo hace la foto y el espacio, no la animación.

**Home**
- Header blanco fino: izquierda BUY / SELL / PRIME, logo centrado en caps espaciadas "THE MODERN HOUSE", derecha JOURNAL / NEWSLETTER / ALERTS / SEARCH.
- Hero split: foto editorial ~65% a la izquierda + panel crema con "TODAY AT THE MODERN HOUSE" (kicker subrayado), titular serif "The Designer's Toolbox: THING" y botón outline "READ MORE". **El hero es un artículo, no una casa ni un buscador.**
- Secciones por colección con label centrado en caps (NEW, FEATURED) y botón outline "VIEW ALL NEW" / "VIEW ALL SALES" a la derecha, separadas por filete fino.
- Tarjetas en grid 3 col: foto 3:2 sin bordes ni sombras, debajo dos líneas: **nombre de la casa** (serif) + precio alineado a la derecha; ubicación + régimen (Freehold/Leasehold) a la derecha. Badges superpuestos en la foto: "OPEN HOME: OCTOBER 24TH, 2026", "NEW" — banda blanca en caps diminutas arriba-izquierda.
- Bandas de prensa: fondo negro, cita serif centrada ("One of the 100 Best Things in the World" — GQ) + CTA outline blanco "HOW MUCH IS MY HOME WORTH?". Se repite con fondo blanco (Evening Standard) y sobre foto (cita larga).

**Detalle (/sales-list/hunts-green-barn)**
- Hero full-bleed con **video en loop silenciado** (botón pausa abajo-izq) y botón "MORE PHOTOS" abajo-der.
- **Tarjeta flotante crema** sobre el hero (abajo-izq): nombre serif grande, ubicación, precio, régimen, links subrayados FLOORPLAN · EPC · MAP · BROCHURE, botones outline "REQUEST VIEWING" y "REGISTER FOR SIMILAR HOMES", "or call +44…", iconos email/WhatsApp para compartir.
- Sección crema: **cita-titular en serif itálica** ("A set of masterfully reimagined barns…") + ensayo de 1 párrafo con arquitecto nombrado (McLaren.Excell) + "READ MORE".
- Galería en pares de imágenes 2 columnas con aire generoso, "MORE PHOTOS".
- Banda negra "Interested? Let's talk." con 3 links subrayados (teléfono, EMAIL US, REQUEST VIEWING).
- **Barra inferior sticky** (desktop): nombre de la casa serif + precio a la izquierda; botones FLOORPLAN · EPC · MAP · BROCHURE outline + "REQUEST VIEWING" negro relleno a la derecha. Aparece al pasar el hero.
- Cookie banner con tres opciones claras incluida "NO THANK YOU".

## Le Collectionist (lecollectionist.com)

**Stack / tokens**
- Nuxt (Vue) + Swiper. Sin GSAP/Lenis. 1 video en la home.
- Fuentes: **Brown** (sans geométrica, H2 32px w400 UPPERCASE letter-spacing 1px), **GT Alpina** (serif display, el "EXTRAORDINARY" condensado del hero), **Ayer** (serif editorial).
- Paleta: casi negro `#202020` texto y botones, gris `#757575` secundario, `#EAEAEA` / `#F7F7F7` fondos. Sin color de acento — todo negro sobre blanco + foto.
- Transiciones: `transform .8s ease` (18 nodos — reveals/slides lentos), `transform .35s ease-out`, `all .3s cubic-bezier(.4,0,.2,1)`, `opacity .4s`, y `grid-template-rows .5s` (acordeones animados con la técnica moderna 0fr→1fr).

**Home (alquiler)**
- Hero full-bleed (foto/video de montaña), kicker "LIVE THE" + display condensado "EXTRAORDINARY" + subtítulo, buscador horizontal blanco Destination | Check-in → Check-out | Guests + botón negro "SEARCH", chip "Wondering where to go? GET INSPIRED".
- Header transparente sobre hero → blanco con buscador compacto al scrollear; teléfono visible, "GET THE APP", favoritos, cuenta.
- "OUR HOMES" centrado con tabs a ambos lados (WINTER CHALETS · FAMILY HOLIDAYS | WINTER SUN · HAUTE MONTAGNE), tab activo con subrayado.

**Listado de venta (/luxury-real-estate-listing)**
- Hero bajo (~30vh) con foto de costa, kicker espaciado "BUY A LE COLLECTIONIST HOUSE", H1 caps "OUR COLLECTION OF HOMES FOR SALE", botón negro "CONTACT US". Una línea vertical fina decorativa baja desde el hero hacia el contenido.
- Grid de **2 columnas** centrado y estrecho (no full width), tarjetas con borde gris muy fino: foto ~4:3, nombre "VILLA LIMOS" en caps, región, "12 guests · 6 bedrooms · 6 bathrooms", filete, precio "€4,400,000". **Sin filtros, sin mapa, sin contador.**
- **Hover**: la imagen escala a 1.05 en 0.5s `cubic-bezier(0.4,0,0.2,1)` + aparece flecha circular blanca para pasar fotos.

## Engel & Völkers Grecia (engelvoelkers.com/gr/en)

**Stack / tokens**
- Next.js. Fuentes propias variables: "Engel Voelkers Head VF" (serif display, H1 40px w700) + "Engel Voelkers Text VF" (sans). Fallback Georgia.
- Colores: texto `#404040` / `#0D0D0D`, gris `#666`, fondos `#F6F6F4` y `#FCFAF5` (crema), negro `#0D0D0D` para botones; **rojo de marca** solo en el "&" del logo, el botón de búsqueda y "Save search".
- Transiciones `.2–.3s cubic-bezier(.3,…)` sobre background/opacity/fill. 5 videos en la home. Sin GSAP/Lenis.

**Home**
- Barra de anuncio arriba (crema, texto pequeño con link), header blanco con logo wordmark, utilidades (Sign in, EN, Locations), nav de 4 ítems + botón negro "Get in touch".
- Hero en 2 niveles: arriba H1 serif "Find your dream property" a la izquierda + buscador a la derecha con tabs BUY/RENT (subrayado rojo) e input "City, district, postal code or E&V ID" + botón rojo cuadrado con lupa. Debajo, **video full-width en una caja con márgenes** (no full-bleed), con overlay "Argironisos, Greece / PRICE ON REQUEST →" y botón pausa.
- Línea vertical roja fina como conector entre secciones; kicker caps "BUYING REAL ESTATE" + H2 serif centrado + párrafo.
- Grid de regiones (Athens, Thessaloniki, Dodecanese, Cyclades, Peloponnese…) en tarjetas blancas con sombra suave, foto + nombre serif + "Properties in the area" + flecha.
- **Pop-up de newsletter** a los pocos segundos ("Always one step ahead") y banner de cookies con modal central — dos interrupciones seguidas: anti-patrón.

**Listado**
- Barra de filtros en una fila: select Buy ▾ · input ubicación con radio "+0 km ▾" · Object type ▾ · Price ▾ · Surface ▾ · "Filters" (icono sliders) · botón rojo "🔔 Save search".
- "Homes for sale in Greece – 4276 results" + chips de región subrayados con contador "Attica (2435)", "Aegean (285)"…, orden "Newest first", **toggle "Map"**.
- Con Map ON: **split view** — lista 2 columnas a la izquierda (~50%), mapa MapTiler/OSM a la derecha con clusters circulares negros con número, "Search full map area", zoom +/− y herramienta de dibujo (lápiz).
- Tarjeta: foto 3:2 con badge verde "NEW", corazón, flechas de carrusel en hover y puntos de paginación; abajo ubicación gris, título serif, "Price" label + €, "3 Bedrooms · 3 Bathrooms · ≈394 m² Living area". Badge "AI" en fotos con staging virtual.

## Sotheby's International Realty (sothebysrealty.com)

**Stack / tokens**
- Next.js + VideoJS. Fuentes: **Freight Big Book** (serif display, H1 46px w400), **Mercury Display** (Roman + Italic), **Benton Sans** (Book/Medium) para UI en caps con tracking.
- Paleta: **azul marino de marca `#002349` / `#00224A`**, blanco, gris `#5B5B5B`, verde muy oscuro `#151B17`; filetes dorados finos como separadores y bullets.
- Transiciones `all .25s ease`, `opacity 1s ease` + `visibility 1s` (fades lentos del hero/slider). 3 videos.

**Home**
- Barra utilitaria azul más oscura (Join / Log In, Preferences), header azul con logo + nav caps (SEARCH, PROPERTIES, AGENTS, STORIES) + botón outline "SELL WITH US".
- Banda azul con H1 serif "Find a home that suits your lifestyle." a la izquierda y buscador a la derecha: tabs caps BUY / RENT / DEVELOPMENTS / SELL / MORE (activo subrayado dorado) + input con solo un filete inferior y flecha larga →.
- Hero **video full-bleed** con overlay arriba-izq "Switzerland · Price Upon Request / VIEW LISTING →" e indicador de slides con líneas.
- Bloques split imagen/texto alternados, cifras grandes serif ("1,100 OFFICES WORLDWIDE", "86 COUNTRIES", "26,000 SALES ASSOCIATES") con filete dorado arriba, sección Sotheby's Concierge Auctions, banda azul "Exclusive Access to Local Experts" con foto que se sale del bloque.

**Listado**
- Fila de filtros: input con lupa + botones rectangulares outline caps: BUY (relleno azul) · RENT · PRICE RANGE · BEDS & BATHS · HOME TYPE · FILTERS.
- "Viewing 24 of 915,199 Homes for Sale in" + nota "Showing listings marketed by all brokers…", "SORT: EXCLUSIVE (DEFAULT) ▾".
- **Split view fijo**: 2 columnas de tarjetas (~45%) + mapa Google a la derecha con clusters azul marino, botones "BOUNDARY" y "REMOVE OUTLINE" (dibujar área), "SAVE SEARCH" y "LIST" flotantes abajo.
- Tarjeta: badge azul "COMING SOON", estrella para guardar, dirección en serif azul en 3 líneas, precio "$9,995,000 USD", bullets dorados para dormitorios/baños/interior/exterior.
- **Hover**: aparecen chevrons finos blancos a los lados de la foto + **barra de progreso** fina azul bajo la imagen (indica foto actual del carrusel) + sombra de tarjeta.

## ERA Residence, Estepona (era-residence.com) — Awwwards SOTD 2026

**Stack / tokens**
- **Webflow + GSAP + ScrollTrigger + Lenis**. 8 videos. Altura de la home ~23.900px (scroll largo por capítulos).
- Fuentes: **Ambroise François** (serif display ultra-condensada de alto contraste, todo en mayúsculas — "RESIDENCE", "APARTMENTS"), **Sloop Script** (caligráfica para "Estepona", "Cookies"), **Maison Neue Extended** (sans ancha en caps diminutas con tracking enorme para labels).
- Paleta: **azul tinta `#17233B`** (texto, 2.484 nodos), **crema `#F3F3EC`**, blanco, **ciruela `#340C24`** (pantalla de carga) y **azul cielo pálido `#B5CEDB`** (fondo de capítulos). Easing `cubic-bezier(.25,…)` y `(.76,…)` en 0.8s para reveals; 0.4s para hovers.

**Experiencia**
- **Preloader** ciruela con logotipo tipográfico centrado, "COSTA ··· DEL SOL" espaciado a los lados, script gigante de fondo en marca de agua, línea vertical que se dibuja.
- Hero: render a pantalla completa, título gigante que se aleja al hacer scroll, "A PLACE ··· TO RETURN TO" partido a ambos lados, **toggle BY DAY / BY NIGHT** que cambia la imagen.
- UI fija: sello circular con texto girando ("ERA RESIDENCE") arriba-izq, indicador numérico de sección "02 → 06 → 10 → 14 → 19" con línea vertical y "SCROLL ↓" en vertical a la izquierda; arriba-der "SELECT AN APARTMENT" (serif subrayado) + "BOOK A CALL / CONTACT".
- **Scroll-driven**: la imagen hace zoom lento, hotspots circulares sobre la imagen, y un **arco gigante azul pálido sube y tapa la imagen** (máscara circular) con texto curvado sobre el arco ("THREE REASONS TO CHOOSE ERA") → transición de capítulo. Imágenes recortadas (PNG sin fondo) que asoman desde los bordes.
- CTA circular "VIEW AVAILABLE APARTMENTS" con anillo fino sobre la imagen.
- Cookie banner como tarjeta crema con "Cookies" en script — cuidado de marca incluso en lo legal.

**Listado (/apartments)**
- Título gigante "APARTMENTS" + contador "25" en el mismo display, alineados a los extremos.
- Barra de filtros dentro de un contenedor de borde fino redondeado: TYPOLOGY ALL ▾ · BEDROOMS ALL ▾ · SORT BY RELEVANT ▾ · RESET (gris).
- Tarjetas 3 col con borde fino y esquinas redondeadas, **el plano es la imagen principal**: "GROUND FLOOR + BASEMENT / COMPLETION: 4Q 2026", plano, "Nº011 · BLOCK B1 · 0 FLOOR", "3 BED / 132 M²" en display, "+ 29 M² TERRACE".
- **Hover**: la tarjeta se eleva (sombra difusa) y el fondo se aclara; transición 0.4s.
- Breadcrumb vertical a la izquierda "HOME / SELECT AN APARTMENT".

## Horizonte Village, Mijas (horizonte-village.com) — Awwwards SOTD 2025

**Stack / tokens**
- Lenis + 3 `<canvas>` (WebGL para el reveal). Sin Webflow ni GSAP global expuesto.
- Fuentes: **Canela** (serif display fina, caps, alto contraste) + **Apercu Mono** (monoespaciada para nav, labels, cookie banner).
- Paleta: **verde-petróleo oscuro `#304143`** (texto/UI), **arena rosada `#DFD8CF`** (fondo), blanco sobre imagen, transparencias del petróleo al 5–10%.
- Easing único y consistente **`cubic-bezier(0.16, 1, 0.3, 1)`** (expo-out) en todo: transform .8s, opacity .8s, padding .6s, fill .4s.

**Experiencia**
- **Splash de elección**: pantalla partida en dos (VILLAS | RESIDENCES) sobre un dibujo lineal del masterplan en tono sobre tono. **Hover: la foto aparece dentro de una mancha de tinta orgánica (WebGL) que sigue al cursor** y el título pasa a blanco. Cada lado lleva "SELECT".
- Hero: video aéreo full-bleed, logotipo "HORIZONTE" gigante con letras muy separadas que ocupa todo el ancho; párrafo serif blanco abajo-izq; header mínimo: "≡ MENU", botón crema "SELECT AN OBJECT", "GENERAL PLAN", teléfono, idioma, "AGENT PORTAL".
- **Texto que se revela letra por letra con el scroll** sobre el video ("PANORAMIC VIEWS, SPACIOUS LAYOUTS, GATED COMMUNITY…") mezclando tamaños y caps/minúsculas.
- El header desaparece al hacer scroll hacia abajo.
- Cookie banner horizontal crema en mono con "READ MORE" y "ACCEPT".

## Aman Residences (aman.com/residences)

**Stack / tokens**
- Sin GSAP/Lenis, sin video en esta página, página larga (~18.000px). Fuentes: **Lyon Text** (serif, H1 72px w400 tracking 1px; H2 31px) para todo lo editorial, **Suisse BP** / **Whitney** / **Beausite** para UI; logotipo "ĀMAN" con macrón en caps espaciadas.
- Paleta: texto `#313131`, grises verdosos `#82847F`, `#999`, fondo **crema `#FDF9F5`**, botón "Enquire" gris oscuro `#404040`. Transiciones `border-color .4s`, `opacity .5s ease-in-out`, `color .4s` — todo es fade, nada se mueve.

**Página**
- Header mínimo: "≡ Menu" + lupa a la izquierda, logo centrado, "English ▾" subrayado + botón sólido "Enquire" a la derecha.
- H1 serif enorme "Aman Residences" alineado a la izquierda con subtítulo "Permanent immersion into the Aman lifestyle", párrafo de manifiesto a la derecha. Link subrayado centrado "Make an enquiry".
- "Destinations" centrado con filete, y a la derecha "FILTER BY · ANY ▾" — un único filtro.
- **Filas alternadas imagen/texto** (imagen ~65% + columna de texto ~35%, y luego al revés): nombre serif "Aman Residences, Dubai", kicker caps gris "DUBAI, UNITED ARAB EMIRATES", párrafo de 2–3 líneas, filete y botón outline pequeño "Discover more" alineado abajo. Sin precio, sin m², sin dormitorios.
- Hover: sin zoom; sólo cambios de borde/color en botones. La sensación de lujo viene de la escala tipográfica, el crema y el aire.
- Cookie modal que solo ofrece "Accept All Cookies" o "Cookie Settings" (sin rechazo directo) — anti-patrón.

## Fantastic Frank (fantasticfrank.com) — antes bloqueado, ahora revisado en Chrome

**Stack / tokens**
- Sin GSAP/Lenis/Next detectables. Fuentes: **MD Lorien** (serif editorial, H1/H2 32px w400 — tamaño contenido, nunca gigante salvo el logo) + **Messina Sans** (UI, pequeña). Logotipo "FANTASTIC FRANK" en grotesk condensada negra.
- Colores en espacio **LAB** (CSS moderno): texto casi negro cálido `lab(13 …)`, fondos **piedra/greige** `lab(95 -0.9 3.4)` ≈ #F0EFE9 y `lab(89 …)` ≈ #E0DED6, blanco al 75% para header translúcido. Transiciones cortas `.15s cubic-bezier(.4,0,.2,1)`, `max-height .3s` para acordeones, `all 1s` para fades.

**Home**
- Hero foto full-bleed (casa de piedra al atardecer) con el logotipo **gigante gris translúcido ocupando todo el ancho** en la base.
- Header: "Menú" a la izquierda; a la derecha "Sobre Frank", "Ubicación *Elegir ubicación* ▾" (el valor en serif itálica gris), idioma "ES ▾".
- Párrafo de bienvenida pequeño arriba-izq y **nube tipográfica de ciudades** centrada en serif grande (Ámsterdam, Barcelona, Ibiza, Mallorca, Marbella…), hover = subrayado. Es la navegación por destino.
- Tarjetas en 2 columnas grandes sobre fondo greige: foto 4:3 sin bordes, "Vipp Residence, Selva" (nombre + lugar), datos en una línea gris pequeña "5 dormitorios · 6 baños · 589 m² + 1,4 ha de parcela · 495.000 € por participación". **Hover sin efecto visual** — sólo cursor.
- Secciones "Most loved", botón flotante cuadrado negro "↑" para volver arriba.

**Detalle (/palma/propiedad/finca-selva/)**
- Foto hero full-bleed; **barra inferior blanca** con "Vipp Residence, *Selva*" (lugar en itálica), datos apilados en el centro y botón outline "SOLICITUD DE INFORMACIÓN ›" a la derecha. Icono de pantalla completa sobre la foto.
- Header translúcido sobre la foto con nav de sección (Comprar · Alquilar · Vender · Mallorca).
- Ensayo largo en 2 columnas (texto a la derecha), "LEER MÁS ▾".
- **Asesores con retrato grande en blanco y negro/color**, cargo ("Consultor inmobiliario", "Socio director de Palma"), teléfono, email y **WhatsApp** como link.
- Fila "Architect: **Lucía Burgos**" y "Highlights" como **lista en serif grande** (Copropiedad para amantes del diseño / Piscina de agua salada y terrazas / Casa de invitados independiente / Cocina de acero Vipp…) — los features se leen como un poema, no como iconos.
- Galería editorial: alterna foto full-bleed con foto a media página y **la otra mitad vacía en crema** — el espacio en blanco como recurso.

## Belgrade Arbor (belgradearbor.rs) — Awwwards SOTD oct 2026, Next.js

**Stack / tokens**
- **Next.js + Lenis + 2 canvas (WebGL)**, 7 videos, ~17.000px de alto. Prueba de que el stack de Kennedy's llega a nivel premio.
- Fuentes vía next/font: **Editorial Old** (serif display de alto contraste, la de Pangram Pangram) + **Work Sans** (UI caps pequeñas).
- Paleta: **verde bosque `#2E3A26`**, crema `#F4F0DB` / `#FFF4D6`, **bronce `#A68150`** (logo y acentos), verde salvia `#60735C`, y un **amarillo-lima `#E7FD55`** como acento puntual.
- Transiciones largas y uniformes: `all .65s cubic-bezier(0.4,…)` (73 nodos), `.5s`, `.6s`.

**Experiencia**
- **Nav flotante tipo píldora** centrada arriba (fondo verde oscuro translúcido): "≡ MENU" · logo bronce · "INQUIRE →" outline. Al abrir el menú, la píldora **se expande en un panel** con el nombre en serif bronce y los ítems en serif centrados (Home, 3D Experience, Residences…).
- Hero: render arquitectónico con efecto de distorsión/blur en WebGL al cargar.
- Capítulos sobre fondo verde: kicker caps lima "BELGRADE ARBOR DESIGN", párrafo serif grande crema a la izquierda, **imágenes con esquinas recortadas en ángulo** (formas poligonales, no rectángulos) que entran con parallax a la derecha, botón píldora outline "EXPLORE IN 3D", barra de progreso fina abajo-izq.

## Compass (compass.com) — rediseño sept 2026

- Fuentes propias **Compass Sans** + **Compass Serif** (titulares serif "See It First™ on Compass"), Inter/Open Sans de apoyo. Paleta blanco/negro `#171717`, sin acento de color (links azul por defecto `#0000EE` en algunos sitios — descuido).
- Hero foto full-bleed, H1 serif blanco + subtítulo sans, buscador con tabs rectangulares Buy/Rent/Sell sobre input blanco + botón negro cuadrado con lupa.
- "Compass Exclusives" en carrusel con flechas cuadradas; tarjetas blancas con radio pequeño y sombra suave, foto 3:2, precio en negrita, "2 beds | 2 baths | 1,460 sqft" y dirección (o "Undisclosed Address"). Tarjeta negra intercalada en el carrusel con CTA píldora blanca "Get early access" — **el carrusel mezcla producto y captación**.
- Banda con foto de interior y CTA píldora "Start your search".
- Transiciones muy cortas: `border-color .1s`, `opacity .3s`, `box-shadow .3s` (elevación en hover). Sin video.

## Knight Frank (knightfrank.com)

- Barra utilitaria gris + botón rojo de marca "Book a consultation"; header negro con logo blanco y nav de 4 ítems.
- Hero partido: **ilustración editorial** (no foto) para "THE RESIDENCE REPORT — The global perspective on luxury residential development" + botón rojo "Explore the report"; panel negro a la derecha "Find us where you are" con select de país. El hero vende investigación, no propiedades.
- Cookie modal centrado con **"Decline all" y "Accept all" del mismo peso** — buena práctica.

## Plum Guide
- "Under maintenance, be back shortly." en el momento de la visita (2026-10-20). No auditable.

## Límites de esta auditoría
- Mobile: la ventana de Chrome no se pudo redimensionar (probablemente maximizada), así que no hay capturas a 390px.
- Christie's, Savills y Knight Frank listado no se recorrieron en Chrome por tiempo; Savills y E&V ya tenían listado/detalle documentados por texto.
- Los efectos de scroll se observaron con capturas sucesivas, no grabados en video/GIF.
