# Evidence-based UX and conversion best practices for luxury real estate websites (for the Kennedy's real estate section)

Scope note: about 20 search/fetch calls. Many primary sources (JamesEdition stories, NAR full reports, Baymard premium research, NN/g article bodies) were blocked (HTTP 403), paywalled or not returned in full. Several figures below come from portal/vendor sources (Rightmove, Zillow, Matterport). They report outcomes on their own platforms and have commercial interests, so treat them as directional. I found no rigorous, independent, luxury-specific UX study. Most evidence is mass-market portal data (US/UK) that has to be read across to luxury.

## Search and filters (map vs list, filter placement, luxury filters, price on request, currency/units, multilingual)

### Takeaway
I found no real-estate-specific research from Baymard or NN/g. Transferable guidance from both: filters must be specific to the domain, ordered from general to specific, and shown on mobile in a "tray" overlay that keeps results visible. Portal data suggests that hiding the price costs visibility, about 10% fewer views on Rightmove. Many portal users filter by price band, so a "price on request" listing needs a deliberate way to still appear in those bands.

### Cited Findings
- Baymard's Product Lists & Filtering research is a large usability study of 19 major e-commerce sites. It produced 83 guidelines, and a 2023 benchmark update added more than 6,100 performance scores across 68 sites. The research is e-commerce, not real estate, and the full guidelines are behind Baymard Premium. — [Baymard research overview](https://baymard.com/research/ecommerce-product-lists); [Baymard 2023 benchmark update](https://baymard.com/blog/2023-benchmark-update-product-lists-filtering)
- Baymard keeps a "Map Listings" design-examples collection (e.g. Hyatt), but I could not retrieve its findings. — [Baymard map listings example](https://baymard.com/ecommerce-design-examples/map-listings/10418-Hyatt)
- NN/g article title and summary: "Mobile Faceted Search with a Tray: New and Improved Design Pattern" says a tray overlay of faceted-search controls is an effective way to show both results and filters on small screens. I read only the summary, not the article body. — [NN/g author listing (Kathryn Whitenton)](https://www.nngroup.com/articles/author/kathryn-whitenton/?page=6)
- NN/g guidance (via a secondary source, Algolia) says to put the most general, high-level filter categories at the top and more specific ones lower down. Desktop and mobile facet behaviour should differ: on desktop, results can refresh instantly when a filter is selected. — [Algolia: Faceted search overview](https://www.algolia.com/blog/ux/faceted-search-an-overview/)
- Older mobile faceted-search patterns (Modal Overlay, Full-Page Refinement, Teaser, etc.) are catalogued by Greg Nudelman (2010, dated). — [UXmatters Part I](https://www.uxmatters.com/mt/archives/2010/04/design-patterns-for-mobile-faceted-search-part-i.php); [Part II](https://uxmatters.com/mt/archives/2010/05/design-patterns-for-mobile-faceted-search-part-ii.php)
- A vendor/agency opinion (not research) says a split view (map plus list) is now an industry standard on property portals, and sticky filter bars (as in Zillow's mobile app) keep controls reachable while the user explores the map. — [raw.studio: Using maps as the core UX in real estate](https://raw.studio/blog/using-maps-as-the-core-ux-in-real-estate-platforms/)
- Rightmove's guidance: listings without a price typically get about 10% fewer views. — [Rightmove Hub: maximise commercial enquiries](https://hub.rightmove.co.uk/how-to-maximise-your-commercial-enquiries-on-rightmove/)
- Agency view: portal buyers search in fixed price brackets, so a listing just outside a popular band can be invisible to many buyers. This implies a listing with no price appears in no band. — [Cooper Adams: Portal prices](https://cooper-adams.com/blog/portal-prices/5242)
- Agent rationale (not outcome data): some luxury agents show the price to pre-qualify buyers, while others use "Price upon request" to prompt direct contact from serious prospects. — [EstatePass: luxury listing](https://www.estatepass.ai/tools/property-lp-generator/for/luxury-listing/)
- Christie's International Real Estate says it translates property descriptions into 19 languages and syndicates listings to outlets such as the WSJ and FT. This is a company marketing claim, but it shows that multilingual listings are standard for top luxury brands. — [Christie's listing presentation](https://brochures.christiesrealestate.com/view/407982236)
- JamesEdition 2025 platform data: inquiries came from users in 238 countries. American buyers made almost a third of international luxury inquiries (about double the next market) and British buyers about one in seven. Continental Europe (Spain, Germany, France, Italy) made up the majority of international activity. — [JamesEdition Buyer Insights 2025](https://www.jamesedition.com/stories/?p=50549) (from a search snippet; the page returned 403 when fetched)
- JamesEdition (April 2026): European markets captured more than 39% of US buyer demand on the platform. — [JamesEdition reports index](https://www.jamesedition.com/data/category/reports/) (search snippet)

### Inferences
- The Kennedy's audience is mainly US, UK and continental European (JamesEdition origin mix). That supports EUR as default with a USD/GBP toggle, an m²/ft² toggle (for US buyers), and at least EN plus FR/ES/DE/IT in time, with EN as the priority.
- For "price on request", show the listing in price-band searches through an internal indicative band or a "Price on request" filter option, and never hide it entirely. Rightmove's 10% view penalty argues for showing prices wherever the seller allows.
- Luxury-specific filters (sea view, pool, plot size, distance to beach, off-market) have no published usage data. Pick them from the inventory's attributes and, after launch, validate with analytics on which filters people actually use.
- With a small, curated inventory (tens of listings, not thousands), heavy faceting is less useful than destination-first browsing (Mykonos / Paros / Athens Riviera / Spain / France) plus a few key filters. The map is best as an optional toggle or split view.

### Gaps
- No Baymard or NN/g study specific to real estate map-vs-list behaviour was retrievable.
- No measured data on how "price on request" affects enquiry rates specifically in luxury.
- No data on the use of currency or unit toggles, or on conversion lift from multilingual versions in luxury real estate.
- No usage data on luxury-specific filters (sea view, plot size, distance to beach).

## Listing cards and detail pages (media, gallery, sticky enquiry, trust signals)

### Takeaway
Across NAR (US), Zillow (US) and Rightmove (UK) data, photos come first, then detailed property info, then floor plans. Floor plans and online/virtual viewings show measurable lifts in views and leads on the portals. On mobile, the first photo does most of the work in results lists.

### Cited Findings
- NAR 2025 Home Buyers and Sellers Generational Trends: 83% of buyers rated photos and 79% rated detailed property information as the most valuable website features, and 57% rated floor plans highly. — [RISMedia on NAR Generational Trends](https://www.rismedia.com/2025/04/02/nar-generational-trends-report-2024-baby-boomer-homebuyers/)
- Same NAR report as reported by a secondary blog: 41% rated virtual tours very useful and 29% videos. This is unverified against the primary report. — [Webtonic](https://www.webtonic.io/blog/real-estate-native-advertising-statistics)
- In the NAR 2022 report, 55% of buyers rated floor plans very useful, so the figure is stable to rising. — [BoxBrownie](https://boxbrownie.com/b/the-nar-report-that-helps-sell-homes-in-a-slowdown)
- Zillow 2022 Consumer Housing Trends Report: 69% of buyers say a dynamic floor plan that shows which part of the home each photo depicts would help them decide. Zillow listings with an Interactive Floor Plan received on average 60% more views (Zillow data, Oct 2022–Mar 2023). — [Zillow 3D Home](https://www.zillow.com/3d-home)
- Zillow (2022 press release, via secondary sources): 81% of buyers were more likely to visit a home if the listing had a floor plan they liked. A later Zillow report (year unclear) says 74% agree 3D tours give a better feel for space than photos, and 70% wish more listings had 3D tours. — [Mann Report](https://www.mannpublications.com/mannreport/2022/06/15/zillow-expands-ai-powered-interactive-tours/); [Virtuance](https://www.virtuance.com/?p=12704)
- Rightmove: listings with more than 5 photos get about 12% more views and enquiries. Floorplans bring about 21% more views and 14% more leads. Any form of online viewing brings about 36% more views and 25% more leads. — [Rightmove Hub](https://hub.rightmove.co.uk/how-to-maximise-your-commercial-enquiries-on-rightmove/)
- Rightmove buyer research: over a third of buyers said they were less likely to enquire about a property without a floorplan, and room dimensions were rated the most important floorplan feature. — [Rightmove: floorplan article](https://www.rightmove.co.uk/news/articles/property-news/maximise-chances-finding-buyer-floorplan/)
- Rightmove: over 70% of traffic is mobile, where only the first photo is seen in search results. Floorplans should go in a dedicated floorplan tab (switchable floors, zoomable), not mixed into the photos. — [Rightmove Hub](https://hub.rightmove.co.uk/how-to-maximise-your-commercial-enquiries-on-rightmove/); [Rightmove overseas magazine](https://www.rightmove.co.uk/overseas-magazine/?p=22625)
- Rightmove Ultimate Listing guides (2022) set out best practice for listing content. — [Sales Ultimate Listing 2022 PDF](https://hub.rightmove.co.uk/content/uploads/2022/01/Sales_Ultimate-Listing_2022.pdf)
- Sotheby's International Realty 2025 Luxury Outlook names virtual tours and AI-driven recommendations as technology trends, and social media as turning homes into "lifestyle showcases". This is qualitative only. — [Sotheby's 2025 Luxury Outlook (Belgium)](https://sothebysrealty.be/the-2025-luxury-outlook-report/)
- Matterport's figures on buyer demand for 3D tours come from a vendor poll and cite NAR 2019. They are not independent. — [Matterport blog](https://matterport.com/blog/property-buyers-and-sellers-want-listings-3d-tours)

### Inferences
- Every luxury listing should have a large, high-quality photo set and a hero image chosen for the card (the first image carries mobile results). It also needs full structured specs (built m², plot m², bedrooms, bathrooms, distances), a floor plan with room dimensions in its own tab, and a video or virtual tour where available.
- International buyers often can't visit before they shortlist, so remote-evaluation media (virtual tour, drone or video of the setting and the distance to the sea) are especially relevant for Mykonos/Paros. This is an inference; there is no luxury-specific data.
- Lifestyle and context content (location, views, nearby amenities) fits the "lifestyle showcase" positioning in the Sotheby's outlook.

### Gaps
- No data on the optimal photo count for luxury listings beyond Rightmove's ">5".
- No independent data on enquiry lift from Matterport specifically in luxury, or on drone footage.
- No research found on sticky enquiry CTAs or trust signals (agent photo, licence, reviews) specific to real estate detail pages.

## Lead capture (form length, WhatsApp/phone/calendar, gated content, conversion benchmarks)

### Takeaway
Conversion benchmarks are mostly vendor-sourced and inconsistent. Lead-to-close is often put at about 0.5–1.5% for internet leads, and average visitor-to-action at about 2.7%. The strongest consistent theme is response speed: the widely cited HBR study found that responding within 5 minutes makes leads far more likely to qualify. I found no rigorous real-estate data on form length, WhatsApp or gated content.

### Cited Findings
- Internet real estate lead-to-close conversion typically falls between 0.5% and 1.5% (vendor estimates, which vary). — [Ylopo](https://www.ylopo.com/blog/real-estate-lead-conversion-rate); [Jamil Academy](https://www.jamilacademy.com/blog/real-estate-lead-conversion-rate-benchmarks)
- One 2026 industry report puts the average real estate visitor-to-conversion-action rate at 2.7%. — [Hyperleap 2026 lead response statistics](https://hyperleap.ai/blog/real-estate-lead-response-statistics-2026)
- The widely cited HBR lead-response research found that a 5-minute response makes leads about 21x more likely to qualify than a 30-minute response (not real-estate-specific). A "391%" figure that also circulates appears to be a misreading. — [Elevista](https://elevista.myclickfunnels.com/blog/speed-to-lead-realestate); [iHomefinder](https://www.ihomefinder.com/?p=55471)
- Roof AI (via a secondary source): only 9% of responsive brokerages replied within the 5-minute threshold. — [Hyperleap](https://hyperleap.ai/blog/real-estate-lead-response-statistics-2026)
- Qobrix (a European real estate CRM vendor) promotes a "15-minute response rule". — [Qobrix](https://qobrix.com/blog/articles/the-15-minute-response-rule-why-speed-matters-more-than-ever-in-real-estate-lead-conversion)
- NAR 2025: 88% of buyers purchased through an agent, and 46% started their search online versus 20% who started by contacting an agent (US, all price points, secondary source). — [NowBam on NAR 2025](https://nowbam.com/88-of-home-buyers-still-rely-on-agents-nar-2025-report-finds)

### Inferences
- In luxury, the website mainly starts a relationship with an advisor, so the enquiry should be low-friction (name, email or phone, optional message, preferred channel). Offer WhatsApp and phone as parallel channels, and set up operations to respond within minutes. Form-length guidance here is inferred from general CRO practice, not real-estate data.
- Gating (off-market list, brochures) is a plausible way to capture qualified leads, but I found no data on its conversion effect.
- Because buyers rely on agents, advisor presence (named advisor, photo, languages spoken) on detail pages should support trust. This is inferred.

### Gaps
- No independent study on form field count in real estate.
- No data on the share of WhatsApp vs. form enquiries in European luxury real estate, or on calendar booking.
- No luxury-specific conversion benchmarks (e.g. enquiry rate per listing view).

## How HNW buyers search and behave online

### Takeaway
Hard data on HNW digital search behaviour is scarce. Available reports (Knight Frank Wealth Report 2025, Sotheby's Outlook 2025, JamesEdition 2025) cover market demand and origins rather than UX behaviour. They show strong Southern European demand, a growing US buyer share in Europe, and lifestyle and infrastructure (airports, berthing) as decision factors.

### Cited Findings
- Knight Frank Wealth Report 2025: Southern Europe was the standout region for prime price growth. Corfu (+8.9%), Porto (+6.8%) and Lucca (+6.2%) led, and 8 of the top 10 European growth locations were in Spain, Portugal, Italy and Greece. — [Knight Frank Wealth Report 2025 PDF](https://content.knightfrank.com/research/3000/documents/en/the-wealh-report-2025-12186.pdf)
- Same report: in 2024, Europe's cities recorded +2.7% prime price growth, outperforming sun locations (-0.1%) and alpine locations (+2.2%) for the first time since the pandemic. Buyer negotiating power has risen since late 2022, and super-prime (US$10m+) sales slowed. — [Knight Frank Wealth Report 2025 PDF](https://content.knightfrank.com/research/3000/documents/en/the-wealh-report-2025-12186.pdf)
- Same report: in the PIRI 100 (12-month prime price change), Marbella was +4.8% and Ibiza +0.7%. Knight Frank Private Office says access for private jets ("can they land their jet nearby") and superyacht berthing can dictate property decisions, and that Greek islands often lack the airport infrastructure. — [Knight Frank Wealth Report 2025 PDF](https://content.knightfrank.com/research/3000/documents/en/the-wealh-report-2025-12186.pdf)
- Knight Frank France: France ranks 8th by number of ultra-wealthy individuals (more than 51,200). — [Galivel press PDF](https://www.galivel.com/media/files/std_conference_de_presse_2025_knight_frank_wealth_report_vf-1.pdf)
- JamesEdition platform buyer volume rose 22.9% in 2025 vs 2024. US buyers were about a third of international inquiries, UK buyers about one seventh. — [JamesEdition Buyer Insights](https://www.jamesedition.com/stories/?p=50549) (snippet)
- Sotheby's 2025 Luxury Outlook: buyer confidence rose after the 2024 elections. It cites an $84 trillion wealth transfer, with Millennials and Gen X favouring lifestyle, community and sustainability. — [Sotheby's 2025 Luxury Outlook](https://sothebysrealty.be/the-2025-luxury-outlook-report/)
- StreetEasy (NYC buyers): 71% began their search online before finding an agent. — [StreetEasy](https://streeteasy.com/blog/what-nyc-buyers-care-about/)
- Knight Frank's most recent Global Buyer Survey I found is from 2021 (more than 900 clients, 49 countries). — [Prime Resi summary](https://primeresi.com/global-property-buyers-in-2021-five-key-stats-five-future-trends/)

### Inferences
- Content on location and access (nearest airport or airstrip, helipad, marina and berthing, travel time) is a decision factor for UHNW buyers and is rarely surfaced on listing pages. This is a differentiation opportunity for island listings.
- The audience is younger and lifestyle-led (Sotheby's) and mostly US/UK (JamesEdition), which supports editorial and lifestyle presentation and English-first copy.

### Gaps
- No 2022–2026 survey data on HNW device use, research time online, or preferred contact channels.
- I could not retrieve Christie's Luxury Defined (recent editions) or the Knight Frank Attitudes Survey figures on purchase intentions.
- I found no Google/Think with Google data specific to luxury property search.

## Mobile usage share and mobile-specific patterns

### Takeaway
Over 70% of Rightmove traffic is mobile, and Google's research shows bounce probability rising sharply with load time on mobile. Mobile design should optimise the first image, a sticky filter/CTA and a filter tray overlay.

### Cited Findings
- More than 70% of Rightmove traffic is mobile, and only the first photo is seen in mobile results. — [Rightmove Hub](https://hub.rightmove.co.uk/how-to-maximise-your-commercial-enquiries-on-rightmove/)
- Google (2017 mobile research): bounce probability rises 32% as page load goes from 1s to 3s, and 123% from 1s to 10s (relative increases). — [Think with Google](https://thinkwithgoogle.com/data/page-load-time-statistics)
- Deloitte "Milliseconds Make Millions": mobile site speed improvements correlated with conversion gains (retail/travel). — [Deloitte PDF](https://www2.deloitte.com/content/dam/Deloitte/ie/Documents/Consulting/Milliseconds_Make_Millions_report.pdf)
- NN/g: a tray overlay for mobile faceted search. — [NN/g listing](https://www.nngroup.com/articles/author/kathryn-whitenton/?page=6)

### Inferences
- Galleries with heavy images (luxury) need responsive images, lazy loading and a fast LCP on the hero, or mobile visitors will bounce.

### Gaps
- No luxury-specific mobile share data, and none for HNW device use. Desktop share may be higher for big-ticket research, but that is unverified.

## Performance, SEO for listing/location pages, accessibility

### Takeaway
RealEstateListing schema exists on schema.org but has no dedicated Google rich result, so its value is semantic. Use supported types such as BreadcrumbList, Organization/RealEstateAgent, Offer/Product where appropriate, plus FAQ and ImageObject. Speed matters for bounce.

### Cited Findings
- A 2026 guide says Google's structured data gallery has no generic real estate listing feature, and that markup aids understanding but doesn't by itself raise rankings. Validate with the Schema Markup Validator rather than the Rich Results Test. — [Jeff Lenney: Real estate schema guide](https://jefflenney.com/real-estate/schema-markup-guide)
- Other guides on structured data for real estate listings. — [seoClarity](https://www.seoclarity.net/blog/structured-data-for-real-estate-listings); [Luxury Presence](https://www.luxurypresence.com/?p=62361)
- Speed and bounce: see the Google figures above. — [Think with Google](https://thinkwithgoogle.com/data/page-load-time-statistics)

### Inferences
- Location landing pages (e.g. "Villas for sale in Mykonos", "Paros", "Athens Riviera") with unique editorial content, market context and filtered listings are the main SEO asset. Individual listings go off-market and expire.
- Accessibility (alt text on gallery images, keyboard-operable galleries and filters, contrast on thin luxury typography) is standard WCAG work. I found no real-estate-specific accessibility research.

### Gaps
- I did not verify against Google's own documentation (search results only).
- No data on hreflang or multilingual SEO impact for luxury property sites.

## Common UX mistakes on luxury real estate sites

### Takeaway
From the evidence above, the mistakes with measurable costs are: hiding the price without an alternative (about 10% fewer views), missing floor plans (more than a third of buyers less likely to enquire), too few photos or a weak first photo (mobile), no online or virtual viewing (about 36% fewer views and 25% fewer leads in Rightmove's comparison), slow pages (bounce up 32% at 1→3s), and slow lead response.

### Cited Findings
- No price: about 10% fewer views. — [Rightmove Hub](https://hub.rightmove.co.uk/how-to-maximise-your-commercial-enquiries-on-rightmove/)
- No floorplan: more than a third of buyers less likely to enquire. — [Rightmove](https://www.rightmove.co.uk/news/articles/property-news/maximise-chances-finding-buyer-floorplan/)
- No online viewing: forgoes about 36% more views and 25% more leads. — [Rightmove Hub](https://hub.rightmove.co.uk/how-to-maximise-your-commercial-enquiries-on-rightmove/)
- Slow load: +32% bounce probability from 1s to 3s. — [Think with Google](https://thinkwithgoogle.com/data/page-load-time-statistics)
- Slow follow-up: only 9% of responsive brokerages replied within 5 minutes. — [Hyperleap](https://hyperleap.ai/blog/real-estate-lead-response-statistics-2026)

### Inferences
- Other likely luxury-specific mistakes: style over usability (low-contrast thin type, autoplay video hero hurting load), generic filters that ignore luxury attributes, no context on location and access, single language, and price shown only in EUR. These come from general UX principles, not measured data.

### Gaps
- No published audit or study of common UX mistakes specific to luxury real estate websites was found.
