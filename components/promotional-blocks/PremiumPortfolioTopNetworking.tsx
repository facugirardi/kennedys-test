import React from 'react'
import { resolveMediaUrl } from '@/lib/utils'

interface PremiumPortfolioTopNetworkingProps {
  className?: string
  premiumPortfolio?: {
    image?: string
    title?: string
    description?: string
  }
  topNetworking?: {
    image?: string
    title?: string
    description?: string
  }
}

const DEFAULT_PREMIUM_PORTFOLIO = {
  image: "/images/tree-image.png",
  title: "Premium Portfolio",
  description: "Our portfolio includes top exclusive properties, as we are the preferred agency in the high-profile Mykonos market, and we have access to almost every property on the island."
}

const DEFAULT_TOP_NETWORKING = {
  image: "/images/pool-image.png",
  title: "Top Networking",
  description: "Our vast experience and strong personal relationships throughout the Mykonos market allows us access to top properties, as well as properties that have not yet gone on the market."
}

export const PremiumPortfolioTopNetworking: React.FC<PremiumPortfolioTopNetworkingProps> = ({
  className = "",
  premiumPortfolio = DEFAULT_PREMIUM_PORTFOLIO,
  topNetworking = DEFAULT_TOP_NETWORKING
}) => {
  return (
    <section className={`relative bg-white px-4 md:px-32 pb-10 ${className}`}>
      <div className="absolute inset-0 bg-[#F5F8FE] top-20 md:top-28 h-[400px] md:h-[600px] z-10" />
      <div className="z-20 max-w-7xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative">
        <div>
          <div className="mb-6">
            {(() => {
              const imageSrc = premiumPortfolio.image || DEFAULT_PREMIUM_PORTFOLIO.image
              const finalImageSrc = imageSrc?.startsWith('/images/') 
                ? imageSrc 
                : (resolveMediaUrl(imageSrc) || imageSrc)
              return (
                <img
                  src={finalImageSrc}
                  className="w-full md:-translate-y-5 h-auto object-cover scale-[1.02]"
                  alt={premiumPortfolio.title || DEFAULT_PREMIUM_PORTFOLIO.title}
                />
              )
            })()}
          </div>
          <h2 className="text-2xl text-[#172338] md:text-4xl font-gtsuper-ds font-thin mb-4">
            {premiumPortfolio.title || DEFAULT_PREMIUM_PORTFOLIO.title}
          </h2>
          <p className="text-[#172338] font-haas font-light">
            {premiumPortfolio.description || DEFAULT_PREMIUM_PORTFOLIO.description}
          </p>
        </div>
        <div className="md:translate-y-16">
          <h2 className="text-2xl text-[#172338] md:text-4xl font-gtsuper-ds font-thin mb-4">
            {topNetworking.title || DEFAULT_TOP_NETWORKING.title}
          </h2>
          <p className="text-[#172338] mb-6 font-haas font-light">
            {topNetworking.description || DEFAULT_TOP_NETWORKING.description}
          </p>
          <div className="w-full md:w-[500px] mt-10 md:mt-28">
            {(() => {
              const imageSrc = topNetworking.image || DEFAULT_TOP_NETWORKING.image
              const finalImageSrc = imageSrc?.startsWith('/images/') 
                ? imageSrc 
                : (resolveMediaUrl(imageSrc) || imageSrc)
              return (
                <img
                  src={finalImageSrc}
                  className="w-full md:translate-y-16 h-auto object-cover scale-[1.02]"
                  alt={topNetworking.title || DEFAULT_TOP_NETWORKING.title}
                />
              )
            })()}
          </div>
        </div>
      </div>
    </section>
  )
}

