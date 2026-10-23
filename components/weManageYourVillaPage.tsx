import { useState, useCallback, useEffect } from 'react'
import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml'
import weManageYourVillaImage from '@/public/images/we-manage-your-villa-image.png'
import planeImage from '@/public/images/plane-image.png'
import eventManageChairsImage from '@/public/images/event-manage-chairs-image.png'
import weManagePoolImage from '@/public/images/we-manage-pool-image.png'
import romanticCoupleImage from '@/public/images/romantic-couple-image.jpg'
import adultsInYachtImage from '@/public/images/adults-in-yacht.jpg'
import businessAircraftImage from '@/public/images/business-aircraft.jpg'
import dessertImage from '@/public/images/dessert.png'
import restRoomImage from '@/public/images/rest-room-image.png'
import gardenImage from '@/public/images/garden-image.png'
import chefImage from '@/public/images/cheff-image.png'
import familyImage from '@/public/images/family-image.png'
import womanLightBlueMintImage from '@/public/images/woman-light-blue-mint.jpg'
import livingRoomImage from '@/public/images/linving-room-image.jpg'
import boatsImage from '@/public/images/boats-image.jpg'

import { PropertieCard } from './custom/propertieCard'
import { useRouter } from 'next/router'
import { ChevronRightIcon } from 'lucide-react'
import OwnerLeadForm from '@/components/custom/OwnerLeadForm'
import { useContact } from '@/src/contexts/ContactContext'
import { getProperty } from '@/lib/api/properties'
import { resolveMediaUrl } from '@/lib/utils'
import { PAGE_HERO_KEYS } from '@/lib/pageHeroBanner'
import { buildRentalDetailPath, buildRealEstateDetailPath } from '@/lib/rentalRoute'
import { MANAGED_WE_MANAGE_VILLA_AGENT_IDS, mapWeManagePropertyToCard } from '@/lib/weManageManagedVillas'
import { getActiveWeManageSections } from '@/lib/api/weManageSections'
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'

type WeManageYourVillaPageProps = {
  initialProperties?: any[];
  initialSections?: Record<string, any>;
  imageOverrides?: Record<string, string>;
};

export const WeManageYourVillaPage = ({
  initialProperties = [],
  initialSections = {},
  imageOverrides = {},
}: WeManageYourVillaPageProps = {}) => {

    const router = useRouter()
    const { openContactForm } = useContact()
    const { isLiked, toggleFavorite, pendingIds } = usePropertyLikes()
    const [properties, setProperties] = useState<any[]>(initialProperties)
    const [isLoadingProperties, setIsLoadingProperties] = useState(!initialProperties?.length)
    const [sections, setSections] = useState<Record<string, any>>(initialSections)
    const [isLoadingSections, setIsLoadingSections] = useState(!(initialSections && Object.keys(initialSections).length))

    // Default properties fallback
    const defaultProperties = [
        {
            title: 'Mykonos Agios Lazzaro',
            location: 'Mykonos, Greece',
            capa1: '1000',
            price: '1000',
            villaImage: '',
        },
        {
            title: 'Mykonos Agios Lazzaro',
            location: 'Mykonos, Greece',
            capa1: '1000',
            price: '1000',
            villaImage: '',
        },
        {
            title: 'Mykonos Agios Lazzaro',
            location: 'Mykonos, Greece',
            capa1: '1000',
            price: '1000',
            villaImage: '',
        },
        {
            title: 'Mykonos Agios Lazzaro',
            location: 'Mykonos, Greece',
            capa1: '1000',
            price: '1000',
            villaImage: '',
        },
        {
            title: 'Mykonos Agios Lazzaro',
            location: 'Mykonos, Greece',
            capa1: '1000',
            price: '1000',
            villaImage: '',
        },
        {
            title: 'Mykonos Agios Lazzaro',
            location: 'Mykonos, Greece',
            capa1: '1000',
            price: '1000',
            villaImage: '',
        },
    ]
    // Load villa properties from API
    useEffect(() => {
        if (initialProperties?.length) {
            console.log('[we-manage-managed-villas] using initialProperties from page (no client refetch)', {
                count: initialProperties.length,
            })
            return
        }
        let isMounted = true

        const loadVillaProperties = async () => {
            setIsLoadingProperties(true)
            try {
                if (!isMounted) return

                console.log('[we-manage-managed-villas] client fetch start', {
                    count: MANAGED_WE_MANAGE_VILLA_AGENT_IDS.length,
                    ids: [...MANAGED_WE_MANAGE_VILLA_AGENT_IDS],
                })

                // Fetch each villa explicitly by agent friendly name to guarantee exact matches.
                const villaResponses = await Promise.all(
                    MANAGED_WE_MANAGE_VILLA_AGENT_IDS.map((agentFriendlyName) => getProperty(agentFriendlyName))
                )

                MANAGED_WE_MANAGE_VILLA_AGENT_IDS.forEach((requestedId, index) => {
                    const raw = villaResponses[index] as any
                    const parsed = raw?.data ?? raw
                    const hasPayload = Boolean(parsed && typeof parsed === 'object' && 'id' in parsed)
                    console.log('[we-manage-managed-villas] response', requestedId, {
                        requestedId,
                        rawSuccess: raw?.success,
                        parsedId: hasPayload ? (parsed as any).id : null,
                        parsedAgentFriendlyName: hasPayload
                            ? ((parsed as any).agentFriendlyName ?? (parsed as any).agent_friendly_name ?? null)
                            : null,
                        hasUsableProperty: hasPayload,
                    })
                })

                const orderedPropertiesData = villaResponses
                    .map((response: any) => response?.data ?? response)
                    .filter(Boolean)

                const missingAfterParse = MANAGED_WE_MANAGE_VILLA_AGENT_IDS.filter((id, i) => {
                    const parsed = (villaResponses[i] as any)?.data ?? villaResponses[i]
                    return !(parsed && typeof parsed === 'object' && (parsed as any).id)
                })
                if (missingAfterParse.length > 0) {
                    console.log('[we-manage-managed-villas] missing or invalid payload (no id)', {
                        missing: missingAfterParse,
                    })
                }
                console.log('[we-manage-managed-villas] fetch summary', {
                    okCount: orderedPropertiesData.length,
                    expected: MANAGED_WE_MANAGE_VILLA_AGENT_IDS.length,
                })

                const mappedProperties = orderedPropertiesData
                    .map((prop: any) => mapWeManagePropertyToCard(prop))
                    .filter(Boolean) as any[]

                if (mappedProperties.length > 0) {
                    console.log('[we-manage-managed-villas] mapped cards', {
                        count: mappedProperties.length,
                        titles: mappedProperties.map((p: any) => p.title),
                    })
                    setProperties(mappedProperties)
                } else {
                    console.log('[we-manage-managed-villas] no mapped properties; falling back to default placeholder cards')
                    // Use default properties if no data
                    setProperties(defaultProperties)
                }
            } catch (error) {
                console.log('[we-manage-managed-villas] load error', error)
                console.error('Error loading villa properties:', error)
                if (isMounted) {
                    // Use default properties on error
                    setProperties(defaultProperties)
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProperties(false)
                }
            }
        }

        loadVillaProperties()

        return () => {
            isMounted = false
        }
    }, [initialProperties?.length])

    // Load sections from API
    useEffect(() => {
        if (initialSections && Object.keys(initialSections).length) return;
        let isMounted = true

        const loadSections = async () => {
            setIsLoadingSections(true)
            try {
                const response = await getActiveWeManageSections()
                if (!isMounted) return

                if (response?.success && Array.isArray(response.data)) {
                    // Map sections by sectionKey for easy access
                    const sectionsMap: Record<string, any> = {}
                    response.data.forEach((section: any) => {
                        sectionsMap[section.sectionKey] = section
                    })
                    setSections(sectionsMap)
                }
            } catch (error) {
                console.error('Error loading sections:', error)
            } finally {
                if (isMounted) {
                    setIsLoadingSections(false)
                }
            }
        }

        loadSections()

        return () => {
            isMounted = false
        }
    }, [initialSections])

    const onCardContainerClick = useCallback((property: any) => {
        const full = property?.property || property;
        if (!full) return;

        if (full.category === 'real-estate' || full.rental === false) {
            if (full.id) {
                void router.push(buildRealEstateDetailPath(full));
            }
            return;
        }

        const agentSeg = [
            full.agentFriendlySlug,
            full.agent_friendly_slug,
            full.agentFriendlyName,
            full.agent_friendly_name,
        ]
            .map((x: unknown) => (typeof x === 'string' ? x.trim() : ''))
            .find((s: string) => s.length > 0);

        if (agentSeg) {
            void router.push(`/agent-property/${encodeURIComponent(agentSeg)}`);
            return;
        }

        const rentalPath = buildRentalDetailPath(full);
        if (rentalPath && rentalPath !== '/villas') {
            void router.push(rentalPath);
        }
    }, [router]);

    // Helper function to render HTML content safely
    const renderHtmlContent = (content: string | null | undefined, fallback: React.ReactNode) => {
        if (!content) return fallback;
        // Check if content contains HTML tags
        if (content.includes('<') && content.includes('>')) {
            return <span dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(content) }} />;
        }
        return content;
    };

    return (
        <>
            <section className='relative flex items-center justify-center h-[18rem] md:h-[28rem]'>
                <img
                    className='absolute top-0 left-0 w-full h-full object-cover brightness-[0.7]'
                    src={sections['hero']?.image ? resolveMediaUrl(sections['hero'].image) : (imageOverrides[PAGE_HERO_KEYS.weManageYourPropertyHero] || weManageYourVillaImage.src)}
                    alt=""
                />
                <h1 className='relative z-10 text-white text-3xl md:text-6xl text-center font-gtsuper-ds font-light px-4'>
                    {renderHtmlContent(sections['hero']?.title, 'We Manage Your Villa')}
                </h1>
            </section>
            <section className='px-4 md:px-32 py-8 md:py-10 mt-6 md:mt-10 flex flex-col justify-center items-center gap-2'>
                <h2 className='text-[#172338] text-2xl md:text-4xl font-gtsuper-ds font-light text-center'>
                    {sections['financial-management']?.title ? (
                        <span dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(sections['financial-management'].title) }} />
                    ) : (
                        <>
                            Financial Management <br className='hidden md:block' />and Revenue Optimization
                        </>
                    )}
                </h2>
                <p className='text-sm md:text-base text-center font-haas font-thin text-[#172338] mt-5'>
                    {sections['financial-management']?.description ? (
                        <span dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(sections['financial-management'].description) }} />
                    ) : (
                        <>
                            Utilizing advanced pricing strategies and market analysis to ensure optimal financial performance. Efficient management of <br className='hidden md:block' /> operating expenses, with detailed budgeting and transparent accounting practices.
                        </>
                    )}
                </p>
            </section>
            <section className='px-4 md:px-32  flex flex-col gap-5'>
                <div className='w-full min-h-[280px] md:h-[520px] p-6 md:px-14 md:pt-14 md:pb-6 flex flex-col justify-end relative'>
                    <img
                        className='absolute top-0 left-0 w-full h-full object-cover brightness-[1] object-[center_66%]'
                        src={sections['unmatched-expertise']?.image ? resolveMediaUrl(sections['unmatched-expertise'].image) : (imageOverrides[PAGE_HERO_KEYS.weManagePropertyUnmatchedExpertise] || familyImage.src)}
                        alt=""
                    />
                    <div className='flex flex-col gap-0 relative z-10 pt-5'>
                        <h2 className='text-[18px] md:text-[24px] font-gtsuper-ds z-10 text-[#172338] uppercase'>
                            {renderHtmlContent(sections['unmatched-expertise']?.title, 'Unmatched Expertise in Luxury Markets')}
                        </h2>
                        <p className='text-sm md:text-base font-haas font-thin z-10 text-[#172338]'>
                            {renderHtmlContent(
                                sections['unmatched-expertise']?.description, 
                                <>Kennedy's Group specializes exclusively in luxury villas in Mykonos and the Greek Islands, <br className='hidden md:block' /> providing targeted expertise that is unparalleled in the region.</>
                            )}
                        </p>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 mt-5 gap-6 md:gap-10'>
                    {[1, 2, 3, 4].map((index) => {
                        const section = sections[`grid-item-${index}`]
                        const defaultImages = [womanLightBlueMintImage, boatsImage, dessertImage, livingRoomImage]
                        const overrideKeys = [
                            PAGE_HERO_KEYS.weManagePropertyGridItem1,
                            PAGE_HERO_KEYS.weManagePropertyGridItem2,
                            PAGE_HERO_KEYS.weManagePropertyGridItem3,
                            PAGE_HERO_KEYS.weManagePropertyGridItem4,
                        ]
                        const defaultTitles = [
                            'Tailored, Full-Spectrum Management Services',
                            'Strategic Marketing and Global Reach',
                            'Innovative and Adaptive Management Practices',
                            'Long-Term Partnerships for Continued Success'
                        ]
                        const defaultDescriptions = [
                            'Efficient management of operating expenses, with detailed budgeting and transparent accounting practices.',
                            'Our dedication to excellence extends to villa owners as well. We provide regular, detailed reporting and are transparent in our operations, so you always feel informed and in control of your investment.',
                            "Utilizing advanced property management systems, we streamline operations, enhance guest interactions, and provide owners with real-time insights into their property's performance.",
                            'Our goal is to foster long-term relationships with property owners, focusing on continual improvement and revenue growth. We view every property we manage as a long-term partnership and invest in its success as if it were our own.'
                        ]
                        
                        return (
                            <div key={index} className='flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-10 text-center md:text-left'>
                                <img 
                                    src={section?.image ? resolveMediaUrl(section.image) : (imageOverrides[overrideKeys[index - 1]] || defaultImages[index - 1].src)}
                                    className='w-full max-w-[480px] h-56 md:h-[400px] md:w-auto md:max-w-[300px] object-cover' 
                                    alt="" 
                                />
                                <div className='flex flex-col gap-3 justify-center'>
                                    <h3 className='text-[18px] md:text-[22px] font-gtsuper-ds font-thin z-10 text-[#172338]'>
                                        {renderHtmlContent(section?.title, defaultTitles[index - 1])}
                                    </h3>
                                    <p className='text-sm md:text-base font-haas font-thin z-10 text-[#172338]'>
                                        {renderHtmlContent(section?.description, defaultDescriptions[index - 1])}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* Download Our Brochure button - Commented out, can be re-enabled if needed */}
                {/* <div className='flex mt-10 justify-center items-center gap-5'>
                    <button className='bg-[#28F6EA] text-[#172338] w-[250px] px-5 py-4 flex items-center gap-2'>Download Our Brochure <ChevronRightIcon className="h-4 w-4 ml-1" /></button>
                </div> */}
            </section>
            <section className='px-4 md:px-32 py-10 mt-10 flex flex-col gap-5'>
                <h2 className='text-[#172338] text-2xl md:text-3xl font-gtsuper-ds font-light'>Properties we manage</h2>
                {isLoadingProperties ? (
                    <div className='text-center py-8 text-[#506A70]'>Loading properties...</div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 place-items-center md:place-items-stretch'>
                        {
                            properties.map((property, index) =>
                                <div key={property.id || index} className='border w-full max-w-[400px]'>
                                    <PropertieCard 
                                        villaImage={property.villaImage} 
                                        title={property.title} 
                                        location={property.location} 
                                        capa1={property.capa1} 
                                        price={property.price} 
                                        onlyTitle={true}
                                        onClick={() => onCardContainerClick(property)}
                                        liked={Boolean(property?.id && isLiked(property.id))}
                                        onToggleFavorite={property?.id ? () => toggleFavorite(property.id) : undefined}
                                        isTogglingFavorite={Boolean(property?.id && pendingIds.has(property.id))}
                                        showFavorite={true}
                                    />
                                </div>
                            )
                        }
                    </div>
                )}
            </section>
            <section className='px-4 md:px-32 py-10 mt-10 flex flex-col gap-[60px]'>
                <h2 className='text-[#506A70] text-3xl md:text-5xl font-gtsuper-ds font-light text-center uppercase'>
                    {renderHtmlContent(sections['why-choose-title']?.title, 'Why Choose Kennedy\'s Group?')}
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-5'>
                    <div className='flex flex-col gap-5'>
                        <img 
                            className='w-full h-48 md:h-[317px] object-cover z-10' 
                            src={sections['legal-operational']?.image ? resolveMediaUrl(sections['legal-operational'].image) : (imageOverrides[PAGE_HERO_KEYS.weManagePropertyLegalOperational] || gardenImage.src)}
                            alt="" 
                        />
                        <h3 className='text-[#172338] text-2xl md:text-3xl font-gtsuper-ds '>
                            {renderHtmlContent(sections['legal-operational']?.title, 'Legal and Operational Responsibility')}
                        </h3>
                        {sections['legal-operational']?.content ? (
                            typeof sections['legal-operational'].content === 'object' && sections['legal-operational'].content.subsections ? (
                                sections['legal-operational'].content.subsections.map((subsection: any, idx: number) => (
                                    <div key={idx} className='flex flex-col gap-1'>
                                        <h2 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>{subsection.title}</h2>
                                        <p className='text-[#172338] text-sm md:text-base font-haas font-light'>{subsection.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>{sections['legal-operational'].description}</p>
                            )
                        ) : (
                            <>
                                <div className='flex flex-col gap-1'>
                                    <h2 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>LEGAL COMPLIANCE: </h2>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'>We ensure all properties meet stringent local regulations, <br className='hidden md:block' />
                                        handling all legal documentation and compliance issues to protect your investment.</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <h2 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>OPERATIONAL EXCELLENCE:</h2>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'> Managing staffing, maintenance, guest relations, <br className='hidden md:block' />
                                        and emergency responses with a dedicated professional team, ensuring the highest <br className='hidden md:block' />
                                        standards are consistently met.</p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className='flex flex-col gap-5'>
                        <img 
                            className='w-full h-48 md:h-[317px] object-cover z-10' 
                            src={sections['operational-support']?.image ? resolveMediaUrl(sections['operational-support'].image) : (imageOverrides[PAGE_HERO_KEYS.weManagePropertyOperationalSupport] || chefImage.src)}
                            alt="" 
                        />
                        <h3 className='text-[#172338] text-2xl md:text-3xl  font-gtsuper-ds '>
                            {renderHtmlContent(sections['operational-support']?.title, 'Total Operational Support Handling')}
                        </h3>
                        <p className='text-sm font-haas font-light md:text-base'>
                            {renderHtmlContent(
                                sections['operational-support']?.description,
                                <>Our operational support ensures a seamless guest experience from arrival to departure. <br className='hidden md:block' /> We begin by gathering key information to personalize their stay, followed by a villa staff <br className='hidden md:block' /> briefing and property inspection to ensure everything is perfect. We handle villa <br className='hidden md:block' /> pre-stocking and setup, ensuring all is ready for the guests' arrival. We handle all check in <br className='hidden md:block' /> details including, greeting guests at the airport & transfers for them to the property, <br className='hidden md:block' /> and provides a complete property tour. We stay in communication with the guest to <br className='hidden md:block' /> provide support thought their stay. At check-out, we manage key collection, damage <br className='hidden md:block' /> reports, and gather feedback. We also maintain detailed client databases, offering analytics <br className='hidden md:block' /> and insights for future performance optimization.</>
                            )}
                        </p>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row mt-10 mb-6 md:mb-28 gap-4 md:gap-0 md:translate-x-[60px]'>
                    {sections['gallery-images']?.content && Array.isArray(sections['gallery-images'].content.images) ? (
                        sections['gallery-images'].content.images.map((img: string, idx: number) => {
                            const zIndexes = ['z-10', 'z-20', 'z-30', 'z-40']
                            const heights = ['h-40 md:h-[216px]', 'h-40 md:h-[211px]', 'h-40 md:h-[196px]', 'h-40 md:h-[171px]']
                            const transforms = [
                                '',
                                'md:-translate-x-10 md:translate-y-28',
                                'md:-translate-x-20',
                                'md:-translate-x-32 md:translate-y-24'
                            ]
                            return (
                                <img 
                                    key={idx}
                                    className={`w-full md:w-[430px] ${heights[idx] || 'h-40'} object-cover ${transforms[idx] || ''} ${zIndexes[idx] || 'z-10'}`}
                                    src={resolveMediaUrl(img)} 
                                    alt="" 
                                />
                            )
                        })
                    ) : (
                        <>
                            <img className='w-full md:w-[430px] h-40 md:h-[216px] object-cover z-10' src={imageOverrides[PAGE_HERO_KEYS.weManagePropertyGallery1] || romanticCoupleImage.src} alt="" />
                            <img className='w-full md:w-[430px] h-40 md:h-[211px] object-cover md:-translate-x-[40px] md:translate-y-28 z-20' src={imageOverrides[PAGE_HERO_KEYS.weManagePropertyGallery2] || adultsInYachtImage.src} alt="" />
                            <img className='w-full md:w-[430px] h-40 md:h-[196px] object-cover md:-translate-x-20 z-30' src={imageOverrides[PAGE_HERO_KEYS.weManagePropertyGallery3] || businessAircraftImage.src} alt="" />
                            <img className='w-full md:w-[430px] h-40 md:h-[171px] object-cover md:-translate-x-32 md:translate-y-24 z-40' src={imageOverrides[PAGE_HERO_KEYS.weManagePropertyGallery4] || dessertImage.src} alt="" />
                        </>
                    )}
                </div>
                <div className='flex flex-col md:flex-row md:justify-between gap-8 '>
                    <div className='flex flex-col gap-5 md:max-w-[48%]'>
                        <h3 className='text-[#172338] text-2xl md:text-3xl font-gtsuper-ds font-normal'>
                            {renderHtmlContent(sections['financial-revenue']?.title, 'Financial Management and Revenue Optimization')}
                        </h3>
                        {sections['financial-revenue']?.content && Array.isArray(sections['financial-revenue'].content.subsections) ? (
                            <div className='flex flex-col md:flex-row gap-6 md:gap-10'>
                                {sections['financial-revenue'].content.subsections.map((subsection: any, idx: number) => (
                                    <div key={idx} className='flex flex-col gap-1'>
                                        <h2 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>{subsection.title}</h2>
                                        <p className='text-[#172338] text-sm md:text-base font-haas font-light'>{subsection.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='flex flex-col md:flex-row gap-6 md:gap-10'>
                                <div className='flex flex-col gap-1'>
                                    <h2 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>REVENUE MAXIMIZATION</h2>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'>Utilizing advanced pricing strategies and<br className='hidden md:block' /> market analysis to ensure optimal financial <br className='hidden md:block' /> performance</p>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <h2 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>COST MANAGEMENT:</h2>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'>Efficient management of operating<br className='hidden md:block' /> expenses, with detailed budgeting and<br className='hidden md:block' /> transparent accounting practices</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col gap-5 md:max-w-[48%]'>
                        <h3 className='text-[#172338] text-2xl md:text-3xl font-gtsuper-ds font-normal'>
                            {renderHtmlContent(sections['rate-analysis']?.title, 'Rate Analysis & Pricelist Plan')}
                        </h3>
                        <p className='text-[#172338] text-sm md:text-base font-haas font-light'>
                            {renderHtmlContent(
                                sections['rate-analysis']?.description,
                                <>Our experienced reservations team carries out a detailed market research and a vast <br className='hidden md:block' /> rate comparison, considering the conditions, services, amenities, facilities and <br className='hidden md:block' /> operational costs of the property, and presents you with a rate analysis and suggested <br className='hidden md:block' /> rate plan, for you to conclude to the ideal villa pricelist per season.</>
                            )}
                        </p>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row items-center justify-center gap-6 md:gap-28 mt-5 mb-5'>
                    <img 
                        className='w-full md:w-[620px] h-48 md:h-[387px] object-cover z-10' 
                        src={sections['tailored-services']?.image ? resolveMediaUrl(sections['tailored-services'].image) : (imageOverrides[PAGE_HERO_KEYS.weManagePropertyTailoredServices] || weManagePoolImage.src)}
                        alt="" 
                    />
                    <div className='flex flex-col mt-4 md:mt-0 text-center md:text-left gap-3'>
                        <h3 className='text-[#172338] text-2xl md:text-3xl font-gtsuper-ds font-normal'>
                            {renderHtmlContent(
                                sections['tailored-services']?.title,
                                <>Tailored, Full-Spectrum <br className='hidden md:block' />Management Services</>
                            )}
                        </h3>
                        {sections['tailored-services']?.content && Array.isArray(sections['tailored-services'].content.subsections) ? (
                            sections['tailored-services'].content.subsections.map((subsection: any, idx: number) => (
                                <div key={idx}>
                                    <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>{subsection.title}</h4>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'>{subsection.description}</p>
                                </div>
                            ))
                        ) : (
                            <>
                                <div>
                                    <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>CUSTOMIZED PROPERTY SOLUTIONS: </h4>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'>We understand that each
                                        villa has its unique charm and requirements. Our services are <br className='hidden md:block' />
                                        tailored to enhance these features, ensuring each property maintains <br className='hidden md:block' />
                                        its distinctiveness while benefiting from proven management practices.</p>
                                </div>
                                <div>
                                    <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light'>ALL-INCLUSIVE MANAGEMENT:</h4>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'>From operational oversight to guest services, marketing, legal compliance, and financial <br className='hidden md:block' />
                                        management, we handle every detail. Our comprehensive approach allows villa owners to <br className='hidden md:block' />
                                        enjoy the benefits of ownership without the complexities of day-to-day management.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className='w-full min-h-[240px] md:h-[430px] overflow-hidden'>
                    <img 
                        className='w-full h-full object-cover object-[center_78%]' 
                        src={sections['rest-room-image']?.image ? resolveMediaUrl(sections['rest-room-image'].image) : (imageOverrides[PAGE_HERO_KEYS.weManagePropertyRestRoom] || restRoomImage.src)}
                        alt="" 
                    />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-5'>
                    {sections['marketing-grid']?.content && Array.isArray(sections['marketing-grid'].content.items) ? (
                        sections['marketing-grid'].content.items.map((item: any, idx: number) => (
                            <div key={idx} className='flex flex-col gap-3'>
                                <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds '>{item.title}</h4>
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>{item.description}</p>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className='flex flex-col gap-3'>
                                <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds '>DYNAMIC MARKETING <br className='hidden md:block' /> STRATEGIES: </h4>
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>
                                    Our aggressive marketing campaigns are <br className='hidden md:block' />
                                    designed to maximize exposure and attract<br className='hidden md:block' />high-caliber guests from around the world.<br className='hidden md:block' />
                                    We employ the latest digital marketing <br className='hidden md:block' />
                                    techniques and partake in elite travel shows <br className='hidden md:block' />
                                    to ensure your property stands out in the <br className='hidden md:block' />
                                    competitive market.
                                </p>
                            </div>
                            <div className='flex flex-col gap-3'>
                                <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds '>EXTENSIVE GLOBAL<br className='hidden md:block' />NETWORK: </h4>
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>Participation in prestigious trade shows <br className='hidden md:block' />
                                    and collaborations with top-tier travel <br className='hidden md:block' />
                                    networks extends our reach, allowing us to <br className='hidden md:block' />
                                    tap into an affluent clientele base that is <br className='hidden md:block' />
                                    looking for the exclusive experiences your <br className='hidden md:block' />
                                    property can provide.Commitment to <br className='hidden md:block' />
                                    Service Excellence
                                </p>
                            </div>
                            <div className='flex flex-col gap-3'>
                                <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds'>GUEST SATISFACTION:</h4>
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>At Kennedy's Group, guest experience is <br className='hidden md:block' />
                                    paramount.We deliver 7-star concierge <br className='hidden md:block' />
                                    services that ensure every guest feels <br className='hidden md:block' />
                                    valued and pampered, increasing the <br className='hidden md:block' />
                                    likelihood of repeat bookings and positive <br className='hidden md:block' />
                                    word-of-mouth.
                                </p>
                            </div>
                            <div className='flex flex-col gap-3'>
                                <h4 className='text-[#172338] text-lg md:text-xl font-gtsuper-ds'>OWNER PEACE OF MIND: </h4>
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>Our dedication to excellence extends to <br className='hidden md:block' />
                                    villa owners as well. We provide regular,<br className='hidden md:block' />
                                    detailed reporting and are transparent in <br className='hidden md:block' />
                                    our operations, so you always feel informed <br className='hidden md:block' />
                                    and in control of your investment
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </section>
            <section className='bg-[#F5F5F5] w-full px-4 md:px-32 py-10'>
                <h2 className='text-[#172338] text-2xl md:text-3xl font-gtsuper-ds font-light text-center'>
                    {renderHtmlContent(sections['exceptional-services']?.title, 'Exceptional Guest and Concierge Services')}
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 justify-between pt-10'>
                    {sections['exceptional-services']?.content && Array.isArray(sections['exceptional-services'].content.items) ? (
                        sections['exceptional-services'].content.items.map((item: any, idx: number) => {
                            const defaultImages = [eventManageChairsImage, planeImage]
                            const overrideKeys = [PAGE_HERO_KEYS.weManagePropertyExceptionalServices1, PAGE_HERO_KEYS.weManagePropertyExceptionalServices2]
                            return (
                                <div key={idx} className='flex flex-col'>
                                    <img
                                        className='w-full h-48 md:h-[306px] object-cover'
                                        src={item.image ? resolveMediaUrl(item.image) : (imageOverrides[overrideKeys[idx]] || defaultImages[idx]?.src)}
                                        alt=""
                                    />
                                    <h3 className='text-primary text-xl md:text-2xl font-gtsuper-ds font-light mt-3'>{item.title}</h3>
                                    <p className='text-[#172338] text-sm md:text-base font-haas font-light'>{item.description}</p>
                                </div>
                            )
                        })
                    ) : (
                        <>
                            <div className='flex flex-col'>
                                <img className='w-full h-48 md:h-[306px] object-cover' src={imageOverrides[PAGE_HERO_KEYS.weManagePropertyExceptionalServices1] || eventManageChairsImage.src} alt="" />
                                <h3 className='text-primary text-xl md:text-2xl font-gtsuper-ds font-light mt-3'>EVENT MANAGEMENT CAPABILITY:</h3>
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>Expertise in planning and executing high-profile events at our properties, adding <br className='hidden md:block' />
                                    significant value and increasing demand for your villa.</p>
                            </div>
                            <div className='flex flex-col '>
                                <img className='w-full h-48 md:h-[306px] object-cover' src={imageOverrides[PAGE_HERO_KEYS.weManagePropertyExceptionalServices2] || planeImage.src} alt="" />
                                <h3 className='text-primary text-xl md:text-2xl font-gtsuper-ds font-light mt-3'>7-STAR CONCIERGE SERVICES:</h3>
                                <p className='text-[#172338] text-sm md:text-base font-haas font-light'>Providing tailored guest services, from private transportation to personalized local <br className='hidden md:block' /> experiences, enhancing guest satisfaction and encouraging repeat visits.</p>
                            </div>
                        </>
                    )}
                </div>
            </section>
            <section
                id="we-manage-villa-lead-form"
                className='bg-white px-4 md:px-32 py-12 scroll-mt-28 md:scroll-mt-36'
            >
                <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-8 md:gap-12 items-start'>
                    <div className='flex flex-col gap-4'>
                        <h2 className='text-[#172338] text-3xl md:text-4xl font-gtsuper-ds font-light'>
                            {renderHtmlContent(sections['partner']?.title, 'Partner with Kennedy\'s Group for villa management')}
                        </h2>
                        <p className='text-[#506A70] text-sm md:text-base font-haas font-light'>
                            {renderHtmlContent(
                                sections['partner']?.description,
                                'Share a snapshot of your residence and desired collaboration so we can prepare an operational and revenue roadmap tailored to your goals. Our team combines global demand intelligence with on-the-ground expertise across the Greek islands.'
                            )}
                        </p>
                        {sections['partner']?.content && Array.isArray(sections['partner'].content.bullets) ? (
                            <ul className='text-[#506A70] text-sm md:text-base font-haas font-light space-y-2'>
                                {sections['partner'].content.bullets.map((bullet: string, idx: number) => (
                                    <li key={idx}>• {bullet}</li>
                                ))}
                            </ul>
                        ) : (
                            <ul className='text-[#506A70] text-sm md:text-base font-haas font-light space-y-2'>
                                <li>• Transparent reporting, budgeting, and performance reviews</li>
                                <li>• Full-service guest experience — from pre-arrival concierge to departure follow up</li>
                                <li>• Dedicated owner success team and proactive property care</li>
                            </ul>
                        )}
                    </div>
                    <OwnerLeadForm
                        leadType="villa-management"
                        visualVariant="navbarContact"
                        title="Request a management consultation"
                        description="Let us know how we can assist and we will reach out within one business day."
                    />
                </div>
            </section>
            <section className='w-full px-4 md:px-32 py-10 bg-[#172338] flex flex-col gap-6 md:gap-10 items-center justify-center text-center'>
                <h2 className='text-white text-[28px] md:text-[34px] font-gtsuper-ds font-thin'>
                    {renderHtmlContent(
                        sections['contact']?.title,
                        <>We're always available to discuss any <br className='hidden md:block' /> questions or issues and can arrange a call or meeting <br className='hidden md:block' /> to explain the process in detail.</>
                    )}
                </h2>
                {sections['contact']?.content ? (
                    <p className='text-white text-sm md:text-base font-haas font-light'>
                        {sections['contact'].content.email && (
                            <>Don't hesitate to email us at <span className='font-semibold underline'>{sections['contact'].content.email}</span> <br className='hidden md:block' /></>
                        )}
                        {sections['contact'].content.phone && (
                            <> or give us a call at <span className='font-semibold underline'>{sections['contact'].content.phone}</span></>
                        )}
                    </p>
                ) : (
                    <p className='text-white text-sm md:text-base font-haas font-thin'>Don't hesitate to email us at <a href='mailto:reservations@kennedysgroup.com' className='font-medium underline'>reservations@kennedysgroup.com</a> <br className='hidden md:block' /> or give us a call at <a href='https://wa.me/306972152778' target='_blank' rel='noreferrer' className='font-medium underline'>+30 697 215 2778</a></p>
                )}
                <button
                    type="button"
                    className='bg-[#28F6EA] text-center text-[#172338] text-sm md:text-base font-haas font-light w-full md:w-[180px] pl-2 pr-0 py-2 md:py-3 flex justify-center items-center gap-2 hover:bg-[#1fe8dc] transition cursor-pointer border-0'
                    onClick={() => openContactForm('PROPERTY_MANAGEMENT')}
                >
                    Contact Us <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" aria-hidden />
                </button>
            </section>
        </>
    )
}
