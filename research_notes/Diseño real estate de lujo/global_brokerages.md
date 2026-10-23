# Global Luxury Brokerage Websites: Design Teardown (SIR, Christie's, Knight Frank, Savills, E&V, Compass, The Agency)

Method note: most of these sites render client-side and block automated fetches. Sotheby's (HTTP 202, empty body) and Christie's/Knight Frank listing pages (JS shells) returned no usable content. The most reliable evidence comes from (a) raw HTML/CSS pulled with curl on 2026-10-20 (fonts, color tokens, server-rendered listing text for Savills, Engel & Völkers, Compass, The Agency), (b) WebFetch-rendered homepages for Knight Frank, Savills and E&V, and (c) official redesign announcements. Nothing was observed visually through screenshots, so statements about layout ratios, hover states and animation are flagged as gaps unless a source supports them.

## Home/landing structure (section order, hero, navigation, footer)

### Takeaway
There are two families. Product-led brokerages (Compass, The Agency, E&V) open with a big search bar in the hero. Advisory firms (Knight Frank, Savills) open with brand, research and service positioning and push property search into the mega-menu. Every site uses a mega-menu or fly-out menu, and footers are dense SEO link farms.

### Cited Findings
**Knight Frank (knightfrank.com, global)**
- Utility header: Newsroom, Careers, About us, Sign in, and a "Book a consultation" CTA. — [knightfrank.com](https://www.knightfrank.com/)
- Mega-menu with four panels. Global solutions (by expertise, by property type including Vineyards and Data Centres, by region). Properties (Dream homes, New homes, Buying guides). Research (The Wealth Report, Active Capital, (Y)our Space). Contact. — [knightfrank.com](https://www.knightfrank.com/)
- Market selector with 52 markets and 25 languages. — [knightfrank.com](https://www.knightfrank.com/)
- The hero is a research promo, not a search bar: "THE RESIDENCE REPORT – The global perspective on luxury residential development", with an "Explore the report" CTA and a static cover image. — [knightfrank.com](https://www.knightfrank.com/)
- Section order: region selector ("Find us where you are"), stats row (130 years, 600+ offices, 20,000+ experts), six service cards, three image-led feature panels ("With us, property is personal", "Access dream homes around the world", "Unlock your next real estate investment"), careers, a general enquiry form (Title, First and Last name, Email, Phone, "How can we help you?"), then a footer with regional link lists and legal/governance links. — [knightfrank.com](https://www.knightfrank.com/)

**Savills (savills.com)**
- Header: logo, location/language selector, site search, My Account, "Menu". The menu has six dropdowns: Find a property, Find a service, Investor Relations, Why Savills, Insight & Opinion, Contact Us. The search-results header also shows a persistent "Book a valuation" button. — [savills.com](https://www.savills.com/); [search.savills.com Greece](https://search.savills.com/list/property-for-sale/greece)
- The homepage shows no search hero. The first block is "How can we help you?" with a "Take me to Savills in…" country selector. After that come brand-statement blocks ("Empowering you with world-class research", "If it matters to you, it matters to us"), a stats row, "Market your property", "Have a question?", an Insight & Opinion article carousel, a newsletter signup, and long link lists by region, listing type and service. — [savills.com](https://www.savills.com/)

**Engel & Völkers (engelvoelkers.com)**
- Top bar: Contact us, language, Locations. Five main menu items with fly-outs: Buy & Rent, Sell property, Real estate agent, Commercial, Company. — [engelvoelkers.com/en](https://www.engelvoelkers.com/en)
- On the Greek site the Buy fly-out includes "Golden Visa Guide in Greece", "Market reports Greece", "Buyers Guide", and region links (Athens, Thessaloniki, Rhodes, Cyclades, Peloponnisos, Ionian Islands, Chalkidiki). "Private Office – The world's most prestigious homes" is surfaced as a separate tier. — [E&V Greece listing](https://www.engelvoelkers.com/gr/en/properties/res/sale/house)
- Hero: a search widget (Buy/Rent toggle, an "AI search" option, property type, search button) over a three-slide rotating carousel with a pause control. The slides are "Buy your dream home", "Sell successfully" (online valuation) and "Become a real estate advisor". — [engelvoelkers.com/en](https://www.engelvoelkers.com/en)
- Section order: Sell value proposition ("Your property deserves the best possible price", 1,100+ locations in 35+ countries), finance banner, six city cards, agent recruitment, lifestyle cards (second homes, polo, maritime, Private Office, events), GG Magazine block, newsletter, SEO link groups (Germany, Europe incl. Mallorca/Paris, worldwide), "Contact your personal advisor" with two advisor portraits, footer. — [engelvoelkers.com/en](https://www.engelvoelkers.com/en)

**Compass (compass.com)**
- Nav: Buy, Rent, Sell, Compass Exclusives (See It First, Private Exclusives, Coming Soon, Compass Listings), New Development, Agents. — [compass.com](https://www.compass.com/)
- Hero: "See It First™ on Compass – Find more homes", with Buy/Rent/Sell tabs and one omnibox ("City, Neighborhood, Address, School, ZIP, Agent, MLS #"). — [compass.com](https://www.compass.com/)
- Then: an exclusives pitch ("Find more homes before they're listed on other real estate sites"), a mortgage preapproval CTA, a Compass Concierge before/after (sell-side), "Find the Neighborhood For You" (NYC, Hamptons, South Florida…), and city/market SEO link lists. — [compass.com](https://www.compass.com/)
- **Recent redesign:** on September 22, 2026 Compass announced "its biggest Compass.com redesign in a decade", covering the homepage, search and listing pages. It added See It First badges, a dedicated landing page, and prominent listing-agent name, photo and brokerage on each listing. — [Compass press release](https://www.compass.com/newsroom/press-releases/BEsYKFmQg2fTbIFTgqDgJ/)

**The Agency (theagencyre.com)**
- Burger menu plus top items: BUY, SELL, RENT, AGENTS, REGIONS, SERVICES, CAREERS, and SIGN IN / SIGN UP. — [theagencyre.com](https://www.theagencyre.com/)
- Hero headline "Your window to the world's finest real estate" in Playfair Display, white, `font-size: max(35px,min(64px,4rem))`, set over imagery/video. Buy/Sell/Rent tabs, an omnibox ("Enter a location, address, listing ID, or agent") and an "Explore Listings" CTA. — [theagencyre.com HTML](https://www.theagencyre.com/)
- Section order: GLOBAL REGIONS ("Wherever you're going, we can take you there", with Mallorca, Marbella, Dominican Republic and others), then FEATURED LISTINGS ("We'll find the home, you'll write the stories"). — [theagencyre.com](https://www.theagencyre.com/)
- July 2023 relaunch: new video and photography, location-adaptive currency and measurement units, saved searches, "request a tour", a "You Might Also Like" article block, an Instagram grid, a "Let's Connect" form, and a "Join The Club" newsletter. — [The Agency blog](https://www.theagencyre.com/blog/introducing-the-new-theagencyre-com-your-window-to-the-worlds-luxury-real-estate/)

**Sotheby's International Realty / Christie's International Real Estate**
- Neither homepage could be retrieved (SIR returned an empty HTTP 202; Christie's returned only the title "Real Estate and Luxury Homes for Sale"). — [sothebysrealty.com](https://www.sothebysrealty.com/eng); [christiesrealestate.com](https://www.christiesrealestate.com/)
- The latest documented SIR global relaunch is June 2020, built with the agency Huge. It was mobile-first (65% of traffic was mobile), with "Instagram-style" mobile listing pages, agent profiles with direct texting, human translation in 15+ languages, and about 60 currency conversions. — [Inman, 2020](https://www.inman.com/2020/06/19/sothebys-international-realty-launches-4-new-website-features/); [search summary of SIR/Anywhere announcement](https://anywhere.re/sothebys-international-realty-debuts-new-editorial-style-website-to-complement-brands-international-presence/)
- The Anywhere Real Estate press URL for the SIR "editorial-style website" now 301-redirects to compassinternationalholdings.com. That suggests SIR now sits under Compass's corporate umbrella, so a re-platforming is plausible but unconfirmed. — [redirect observed 2026-10-20](https://anywhere.re/sothebys-international-realty-debuts-new-editorial-style-website-to-complement-brands-international-presence/)

### Inferences
- For Kennedy's, the strongest pattern is a hybrid: a search-led hero like The Agency or E&V, combined with an editorial and destination layer like Knight Frank's research or E&V's GG Magazine.
- Everyone pushes "Sell / valuation" into the first screen or the nav (E&V hero slide 2, Savills header button, Compass Concierge). That is the main seller-acquisition lever.

### Gaps
- No visual capture of the SIR or Christie's 2026 homepages. Whether the SIR site changed after the Compass–Anywhere combination could not be verified.
- Hero video vs still image could not be confirmed for most sites. Text-only extraction cannot show it.

## Visual language (typography, color, whitespace, photography, video)

### Takeaway
The house style is consistent across the category: a high-contrast or editorial serif for headlines plus a neutral geometric or grotesk sans for UI. Several brands commission proprietary fonts (E&V, Compass, Knight Frank's licensed Tiempos/Suisse). Christie's and The Agency use the free Playfair Display, which is the most "default luxury" choice.

### Cited Findings
- **Christie's:** CSS uses `Gilroy, sans-serif` (65 declarations) as the main UI face and `Playfair Display, Georgia, serif` for headings. Playfair is loaded from Google Fonts (ital, weights 400–900). — [christiesrealestate.com CSS](https://www.christiesrealestate.com/pf/dist/components/combinations/default.css)
- Bitovi's Christie's redesign built a Figma design system of reusable components, content blocks and editorial patterns, with "generous spacing, careful typography, and visual restraint", and reported a "30.9% increase in perceived luxury". The case study is undated. — [Bitovi](https://design.bitovi.com/christies)
- **Knight Frank:** the app CSS uses `suisse, Arial, sans-serif` (205 declarations) for body and UI and `tiempos headline, Times, serif` (44) for headlines. Color tokens include dark `#202320`, white, and brand reds `#d0103a` / `#9b1632` used as division border colors. — [knightfrank.com CSS](https://www.knightfrank.com/properties-resources/assets/app-dca24880.bundle.css)
- **Savills:** Gotham sans (served from assets.savills.com/fonts/gotham) plus `DomineWebRegular, Georgia` serif, with Domine bold/regular webfonts. — [search.savills.com HTML](https://search.savills.com/list/property-for-sale/greece)
- **Engel & Völkers:** proprietary variable fonts `Engel Voelkers Head VF App` (heading, Georgia fallback, so a serif) and `Engel Voelkers Text VF App` (text). Color tokens include `--color-cod-gray:#0D0D0D`, `--color-desert-storm:#F6F6F4`, `--color-brown-light:#EFE8DF`, `--color-early-dawn:#FFF8E8`, `--color-equator:#E6B96E` (warm gold) and `--color-dove-gray:#666666`. The palette is warm neutrals, near-black and a gold accent, with E&V red in the logo. — [E&V CSS](https://autogen-buyer.engelvoelkers.com/)
- The 2023 E&V refresh came from Saffron with a custom type by Dalton Maag. The villa symbol was detached from the wordmark, and proprietary fonts, framing elements and patterns were added. It took two years of development and launched at EVX Miami in March 2023. — [logo-designer.co](https://www.logo-designer.co/saffron-rebrands-german-real-estate-agency-engel-volkers/); [Inman 2023](https://www.inman.com/2023/04/07/anthony-hitt-ev-looks-to-future-while-doubling-down-on-the-basics/)
- **Compass:** proprietary `Compass Sans` and `Compass Serif`, plus `Inter` as a "NeutralSans" and `Open Sans` as a "Legible" face, all through CSS variables (`--cx-font-familySans` etc.). — [compass.com fonts.min.css](https://www.compass.com/ucfe-assets/fonts/3/fonts.min.css)
- **The Agency:** Google Fonts `Playfair Display` (headlines) plus `Lato` 300/400/700 (body), running on a white-label platform (`ibp-cdn` icon fonts, `/dashboard/Access.aspx`). — [theagencyre.com HTML](https://www.theagencyre.com/)

### Inferences
- A serif headline plus sans UI is table stakes. To stand out, Kennedy's should avoid Playfair (Christie's and The Agency use it, and it reads as a template) and pick a more distinctive licensed serif in the spirit of Tiempos (Knight Frank) or a custom face, paired with a refined grotesk like Suisse or Inter.
- E&V's warm-neutral token set (off-white `#F6F6F4`, sand `#EFE8DF`, gold `#E6B96E`, near-black `#0D0D0D`) suits a Mediterranean brand well.

### Gaps
- Photography style, use of video and whitespace density were not visually verified for any site.
- SIR's typefaces were not retrieved because the site was blocked.

## Listing/search page (layout, filters, sorting, count, pagination, saved searches)

### Takeaway
Savills and E&V both use a top filter bar with dropdowns, a prominent results count in the H1, a three-option sort, a "Save search" action and numbered pagination (not infinite scroll). Compass is the reference for map-first split view. Results counts are huge (Savills 676 in Greece, E&V 1,268 houses), so faceted region chips matter.

### Cited Findings
- **Savills Greece:** location box ("Search by location, postcode or development name"), "Select region", a "Search (676)" button showing a live count, "Search near me", and a Filters panel with Price range, Property types, Bedrooms, Receptions, Bathrooms and Property size, plus Clear Filters. — [Savills Greece](https://search.savills.com/list/property-for-sale/greece)
- Savills H1: "676 Properties for sale in Greece", with a "Save search" button right beside it. Sort options: Most recent, Lowest price first, Highest price first. Numbered pagination (1, 2, 3 … 43, Previous/Next). — [Savills Greece](https://search.savills.com/list/property-for-sale/greece)
- **E&V Greece:** filter bar with location plus a radius ("+0 km"), Property type, Price, Surface and "Filters". The H1 reads "Houses for sale in Greece – 1268 results", followed by region facet chips with counts (Attica 404, Macedonia and Thrace 331, Aegean 243, Peloponnese/Ionian 162…). Sort: "Newest first". Numbered pagination with prev/next arrows. — [E&V Greece](https://www.engelvoelkers.com/gr/en/properties/res/sale/house)
- E&V also offers "AI search" in its hero search. — [engelvoelkers.com/en](https://www.engelvoelkers.com/en)
- **Compass:** search results are a split view with an interactive map and a filterable grid (third-party gallery). The map refreshes as you pan, Compass listings use differently colored pins, you can search several cities at once (2019 release), and there is a draw-on-map tool in the app. — [Nicelydone](https://nicelydone.club/examples/apps/compass); [screensdesign](https://screensdesign.com/showcase/compass-real-estate-homes); [search summary of Compass releases](https://www.compass.com/newsroom/press-releases/2SotgA2Oh2rFkFE48UGD0R/)
- The September 2026 Compass redesign rebuilt the search experience around See It First, with badges and premium placement for test-the-market listings. — [Compass press release](https://www.compass.com/newsroom/press-releases/BEsYKFmQg2fTbIFTgqDgJ/)
- **The Agency:** saved searches, property portfolios, tour sheets, map-boundary search, and adjustable measurement and currency. — [The Agency Phase I](https://blog.theagencyre.com/powering-your-search-for-real-estate-phase-i-of-the-agencys-new-website-is-live/); [The Agency 2023](https://www.theagencyre.com/blog/introducing-the-new-theagencyre-com-your-window-to-the-worlds-luxury-real-estate/)
- **Knight Frank:** the "My Knight Frank" rebuild added advanced search and a buyer's timeline on a new digital design system (agency You Not Me). — [You Not Me](https://www.younotme.co.uk/featured-work/knight-frank)

### Inferences
- Kennedy's has far fewer listings, so a curated grid with destination chips (Mykonos / Paros / Athens Riviera / Spain / France), an optional map toggle and a "Save search / Alert me" action fits better than mass-portal pagination.
- A live count on the search button ("Search (676)") is a cheap, high-value micro-interaction worth copying.

### Gaps
- Map split view on Savills, E&V, SIR, Christie's and Knight Frank was not verified. Their listing pages are JS-rendered or were not visually inspected.

## Property cards

### Takeaway
Cards carry a photo carousel with a counter ("1/13"), a Save/favorite heart, status badges (New, Exclusive), price and beds/baths/area. Savills uniquely puts the named agent and phone, with "Contact now", on every card.

### Cited Findings
- **Savills card:** "New" badge, carousel counter "1/13", Save. Title ("Bespoke under construction villa"), location (Voula, Attica), area in sq ft with sq m in parentheses, "Asking price €9,000,000", three bullet features (Swimming pool, Amazing sea view, Wellness facilities), the agent's name, office and phone, a "Contact now" button, then type plus bedroom, bathroom and reception icons. — [Savills Greece](https://search.savills.com/list/property-for-sale/greece)
- Savills' Mykonos example: "Serene villa with amazing sea views, Lia, Mykonos", €3,500,000, 318 sqm built on a 3,342 sqm plot, 7 bedrooms and 6 bathrooms, 72 sqm pool. — [Savills Greece](https://search.savills.com/list/property-for-sale/greece)
- **E&V card:** a "New" or "Exclusive" badge, "Add to favorites", location breadcrumb (e.g. "Kostos, Southern Aegean, Greece"), title ("Exceptional subterranean villa with infinity pool near Naousa, Paros"), price €2,000,000, then "3 Bedrooms | 4 Bathrooms | ~200 m² Living area | ~3,500 m² Plot surface". — [E&V Greece](https://www.engelvoelkers.com/gr/en/properties/res/sale/house)
- **The Agency featured card:** title, city and USD price (e.g. "Exceptional Duplex Residence on Avenida da Liberdade, Lisboa, $10,000,000"), with currency adapting to the visitor's location. — [theagencyre.com](https://www.theagencyre.com/); [The Agency 2023](https://www.theagencyre.com/blog/introducing-the-new-theagencyre-com-your-window-to-the-worlds-luxury-real-estate/)
- **Compass (from 2026):** See It First badges on cards. — [Compass press release](https://www.compass.com/newsroom/press-releases/BEsYKFmQg2fTbIFTgqDgJ/)

### Inferences
- For Mediterranean sales, plot size alongside living area (E&V's pattern) is essential, and so is a "sea view / pool" feature line (Savills' pattern).

### Gaps
- Image aspect ratios and hover states could not be measured without visual rendering.

## Property detail page

### Takeaway
The Savills and E&V detail pages follow the same skeleton: a gallery with a counter, an expand mode and Map/Street View tabs; a facts strip; a key-features list; a long description; local information with distances; a named advisor with phone and a "Request details" form; and an energy and details table (E&V). Neither showed floor plans or virtual tours in the extracted text.

### Cited Findings
- **Savills detail (Voula villa):** tabs Gallery / Expand / Map / Street View, then "Property details" and "Contact an agent". The price is shown in dual currency (€9,000,000 / £7,569,531). Share and Save. Key features list, then a long "About this property" description organized floor by floor. — [Savills detail](https://search.savills.com/property-detail/grathsavf55999)
- Savills follows with "Local information" (an area narrative), then a distances block (17 km City center, 7 km Golf Club, 13 km Alimos marina, 20 km Athens International Airport), a named agent with phone, "Contact now", "Request details", and cross-sells ("Market your property", finance partner, newsletter). — [Savills detail](https://search.savills.com/property-detail/grathsavf55999)
- **E&V detail:** "Add to favorites" and "Request details" at the top, gallery counter 1/23, a location breadcrumb (Greece > Central Macedonia > Panorama), title, price, then beds, baths, total and living surface, and construction year. — [E&V detail](https://www.engelvoelkers.com/gr/en/exposes/52748cc1-1878-54ab-80e8-c4f283045461)
- E&V continues with a Description section ("Show more" collapse), feature tags (Balcony, Fireplace, Mountain view…), the office name and phone, "Your advisor: [name]", a Property ID, and a structured Property details table (object type, floors, flooring). An Energy efficiency block (class, certificate, heating, energy source) and a "Location" narrative (unique features, accessibility) follow. It ends with "Request all property details", a form with First name, Last name, Email and a prefilled message plus GDPR consent. — [E&V detail](https://www.engelvoelkers.com/gr/en/exposes/52748cc1-1878-54ab-80e8-c4f283045461)
- **Compass 2026 listing pages:** prominent listing-agent name, photo and brokerage. A third-party UX review calls the Compass detail page long and suggests tabs or collapsible sections. — [Compass press release](https://www.compass.com/newsroom/press-releases/BEsYKFmQg2fTbIFTgqDgJ/); [screensdesign](https://screensdesign.com/showcase/compass-real-estate-homes)
- **The Agency:** "request a tour" from the listing. — [The Agency 2023](https://www.theagencyre.com/blog/introducing-the-new-theagencyre-com-your-window-to-the-worlds-luxury-real-estate/)
- **SIR (2020):** mobile "Instagram-style" listing pages, and agent texting directly from the profile. — [Inman 2020](https://www.inman.com/2020/06/19/sothebys-international-realty-launches-4-new-website-features/)

### Inferences
- The Savills distance block (marina, airport, golf, beach) is a high-value, low-cost module for island properties. For Kennedy's, add ferry port and heliport.
- Dual-currency pricing (Savills) and visitor-adaptive currency (The Agency, SIR) matter for international buyers of Greek, Spanish and French property.

### Gaps
- Whether the enquiry module is sticky, and the floor plan, virtual tour (Matterport) and video placement on each site, could not be confirmed from text extraction.

## Destination pages and editorial storytelling

### Takeaway
Editorial is a core luxury differentiator. Knight Frank leads with research (The Wealth Report), E&V with GG Magazine and market reports, The Agency with The Agency Magazine and blog categories, and Savills with Insight & Opinion. Destination hubs appear as region cards (E&V, The Agency) and SEO link farms (Compass).

### Cited Findings
- Knight Frank's homepage hero is a research report, and its mega-menu Research panel promotes The Wealth Report, Active Capital and (Y)our Space. — [knightfrank.com](https://www.knightfrank.com/)
- Savills runs dated Insight & Opinion articles with topic tags in a carousel, plus an "Explore local property markets" CTA. — [savills.com](https://www.savills.com/); [Savills Greece](https://search.savills.com/list/property-for-sale/greece)
- E&V runs GG Magazine (architecture and lifestyle, with print pickup). The Greek site adds a Golden Visa Guide, Market reports Greece, a Buyers Guide and region pages, including the Cyclades. — [engelvoelkers.com/en](https://www.engelvoelkers.com/en); [E&V Greece](https://www.engelvoelkers.com/gr/en/properties/res/sale/house)
- The Agency runs a Global Regions carousel (including Mallorca and Marbella), The Agency Magazine, and blog categories: News & Insights, Market Reports, Properties, Lifestyle & Design, Community, Philanthropy. — [theagencyre.com](https://www.theagencyre.com/); [The Agency 2023](https://www.theagencyre.com/blog/introducing-the-new-theagencyre-com-your-window-to-the-worlds-luxury-real-estate/)
- Compass runs "Find the Neighborhood For You" (with "the agents who know them best"), plus city and market link lists. — [compass.com](https://www.compass.com/)

### Inferences
- A Kennedy's "Golden Visa Greece" guide and island market reports (Mykonos, Paros) are direct, proven content plays (E&V Greece does exactly this).

### Gaps
- Christie's "Luxury Defined" and SIR's "Extraordinary Living" editorial were not retrieved in 2026 form (the SIR blog URL returned a 404).

## Lead capture and CTAs

### Takeaway
Valuation ("Book a valuation" / "Get an online valuation") is the universal seller CTA. Buyer CTAs are "Request details", "Contact now" with a named agent, and "request a tour". Newsletters are positioned as exclusive-listing clubs. None of the extracted pages showed a WhatsApp button.

### Cited Findings
- Savills: "Book a valuation" ("Prefer virtual? We can do that too"), "Contact now", "Request details", "Subscribe to receive exclusive news and listings", MySavills (track your sale, documents), and a finance partner CTA. — [Savills Greece](https://search.savills.com/list/property-for-sale/greece); [Savills detail](https://search.savills.com/property-detail/grathsavf55999)
- E&V: online valuation in the hero carousel, "Request real estate valuation" / "Valuate property" in the menu, a newsletter, "Contact your personal advisor" with portraits, and "Request all property details" with GDPR consent. — [engelvoelkers.com/en](https://www.engelvoelkers.com/en); [E&V detail](https://www.engelvoelkers.com/gr/en/exposes/52748cc1-1878-54ab-80e8-c4f283045461)
- Knight Frank: "Book a consultation" in the header, plus a free-text "How can we help you?" form on the homepage. — [knightfrank.com](https://www.knightfrank.com/)
- Compass: mortgage preapproval ("See What I Qualify For"), Concierge for sellers, and See It First as an exclusive-access hook. — [compass.com](https://www.compass.com/)
- The Agency: a "Let's Connect" form (name, email, optional phone, best call time, preferred agent, address, message) and a "Join The Club" weekly newsletter. — [The Agency 2023](https://www.theagencyre.com/blog/introducing-the-new-theagencyre-com-your-window-to-the-worlds-luxury-real-estate/)
- SIR (2020): direct texting with the agent. — [Inman 2020](https://www.inman.com/2020/06/19/sothebys-international-realty-launches-4-new-website-features/)

### Inferences
- Kennedy's can win on WhatsApp and "book a private viewing / video viewing", which these majors under-use, plus an "off-market / private collection" signup modeled on Compass Private Exclusives and E&V Private Office.

### Gaps
- No evidence was found either way on WhatsApp CTAs for Mediterranean franchise sites (e.g. E&V Mykonos, SIR Greece).

## Micro-interactions, mobile and best-in-class vs dated

### Takeaway
Best-in-class: Compass (map search, proprietary type system, 2026 redesign), Knight Frank (Tiempos/Suisse editorial typography with research-led authority), and E&V (custom variable fonts, warm token palette, AI search, rich detail data). Dated or anti-patterns: auto-rotating hero carousels (E&V), corporate-first homepages that bury property search (Savills, Knight Frank), template Playfair luxury (Christie's, The Agency), and giant SEO link footers.

### Cited Findings
- SIR's 2020 site was mobile-first because 65% of traffic was mobile. — [Inman 2020](https://www.inman.com/2020/06/19/sothebys-international-realty-launches-4-new-website-features/)
- E&V's hero is an auto-rotating carousel with a pause control (an accessibility mitigation). — [engelvoelkers.com/en](https://www.engelvoelkers.com/en)
- Compass's app uses animated listing clusters and a draw-search tool. — [screensdesign](https://screensdesign.com/showcase/compass-real-estate-homes)
- The Agency runs on a white-label platform and uses inline-styled hero type (`style="font-family:'Playfair Display'…"`), which points to a template CMS. — [theagencyre.com HTML](https://www.theagencyre.com/)
- Savills' homepage leads with corporate content (investor relations, ESG, services by sector, including "Selling a Quarry"). For a luxury buyer, residential search is buried. — [savills.com](https://www.savills.com/); [Savills Greece](https://search.savills.com/list/property-for-sale/greece)

### Inferences
- For a boutique like Kennedy's, the opportunity is to combine E&V/Savills-level data depth (plot, energy class, distances) with Compass/Knight Frank-level typography and a magazine-style destination layer. The majors' corporate clutter should be avoided.

### Gaps
- Scroll animations, hover states, transitions and mobile layouts were not observed directly. A follow-up with real browser screenshots (Chrome tooling) would close this gap, especially for SIR and Christie's.
