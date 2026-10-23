import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { ContactInquiryType } from '@/lib/contactInquiryTypes'

interface ConciergePackagesSectionProps {
  /** Default Concierge for this block (villa detail override still uses CONCIERGE for the package CTA). */
  contactPreset?: ContactInquiryType | null
  data?: {
    title?: string
    description?: string
    image1?: string
    image2?: string
    image3?: string
    package5StarsTitle?: string
    package5StarsDescription?: string
    package6StarsTitle?: string
    package6StarsDescription?: string
    package7StarsTitle?: string
    package7StarsDescription?: string
    buttonText?: string
    buttonLink?: string
  }
}

export const ConciergePackagesSection: React.FC<ConciergePackagesSectionProps> = ({
  data,
  contactPreset = 'CONCIERGE',
}) => {

  return (
    <div className="relative -mx-4 w-[calc(100%+2rem)] max-w-none py-14 md:-mx-24 md:w-[calc(100%+12rem)]">
    <section className="w-full mb-20 bg-[#F0F3F5] min-h-[24rem] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-6 relative px-6 md:px-12 lg:px-16 xl:px-20 py-10 lg:py-0">
      {/* Image collage - left side */}
      <div className="relative mx-auto lg:mx-0 lg:flex-shrink-0 w-full max-w-[36rem] lg:translate-x-0">
        {/* Mobile: imagen única */}
        <div className="lg:hidden w-full aspect-[16/9] overflow-hidden">
          <img
            src={data?.image2 || "/images/concierge-1.png"}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Desktop: collage de 3 imágenes */}
        <div className="hidden lg:block relative w-full max-w-[36rem] h-[24rem] mx-auto lg:mx-0">
          {/* Image 3 (fondo): boat - bottom-left, 414x221 */}
          <img
            src={data?.image3 || "/images/boat-image.png"}
            alt=""
            className="absolute left-0 -bottom-16 w-[414px] max-w-[85%] h-auto aspect-[414/221] object-cover z-20"
          />
          {/* Image 2: middle-right, 500x258 */}
          <img
            src={data?.image2 || "/images/concierge-1.png"}
            alt=""
            className="absolute -right-24 xl:-right-24 top-1/2 -translate-y-1/2 w-[min(500px,55vw)] max-w-[90%] h-auto aspect-[500/258] object-cover z-10"
          />
          {/* Image 1 (delante): pool - top-left, 386x224 */}
          <img
            src={data?.image1 || "/images/mykonos-card-image.png"}
            alt=""
            className="absolute left-0 -top-10 w-[386px] max-w-[80%] h-auto aspect-[386/224] object-cover z-0"
          />
        </div>
      </div>
      {/* Text block - right side */}
      <div className="flex flex-1 flex-col justify-center items-start w-full min-h-0 min-w-0 lg:max-w-[55%] xl:max-w-[40%]">
        <div className="text-left w-full">
          <h2 className="font-gtsuper-ds font-light break-words mb-2 text-black text-2xl md:text-4xl">Get access to our Luxury concierge packages for itinaries, booking, experiences</h2>
          <p className="text-md font-haas break-words text-black font-light">Choose between our three concierge level packages the one that best suits your needs -and budget- and let us worry about all the rest. Of course, you can always ask us to design your own special package, tailored to your personal desires!</p>
        </div>
      </div>
    </section>
    <section className="w-full mt-14 flex flex-col md:flex-row justify-between gap-10 items-stretch px-6 md:px-12 lg:px-16 xl:px-20 py-6">
      <div className="flex-1">
        <p className="font-gtsuper-ds font-normal text-[#D99330] text-2xl mb-4">5 STARS</p>
        <p className="break-words font-haas font-light">Indulge in a stress-free getaway with personalized itinerary planning, VIP access, and seamless coordination of your travel needs.</p>
      </div>
      <div className="flex-1">
        <p className="font-gtsuper-ds font-normal text-[#D99330] text-2xl mb-4">6 STARS</p>
        <p className="break-words font-haas font-light">Elevate your experience with enhanced services, including 24/7 dedicated concierge support, expedited access, and prime seating at top venues and events.</p>
      </div>
      <div className="flex-1">
        <p className="font-gtsuper-ds font-normal text-[#D99330] text-2xl mb-4">7 STARS</p>
        <p className="break-words font-haas font-light">Reach for the sky with our most exclusive package, offering unlimited changes to your itinerary, personalized assistance throughout your stay, and access to the most coveted experiences and venues worldwide.</p>
      </div>
    </section>
    <div className="flex justify-center items-center mt-10 pb-10">
      <Link
        href="/concierge/list?type=Concierge+Packages"
        className="flex justify-center items-center gap-2 w-48 h-12 md:h-14 px-8 bg-[#28F6EA] text-[#172338] hover:bg-[#13d6cc] transition-colors font-haas text-sm"
      >
        View More <ChevronRight size={20} />
      </Link>
    </div>
  </div>
  )
}
