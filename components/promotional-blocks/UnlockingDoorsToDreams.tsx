import React from 'react'
import { resolveMediaUrl } from '@/lib/utils'

interface UnlockingDoorsToDreamsProps {
  className?: string
  title?: string
  description?: string
  items?: Array<{
    image?: string
    title?: string
  }>
}

const DEFAULT_ITEMS = [
  {
    image: "/images/image-unlockdoor.jpg",
    title: "Top level commercial and residential real estate services"
  },
  {
    image: "/images/image-unlockdoor-1.jpg",
    title: "Top quality hospitality and brand consultancy services"
  },
  {
    image: "/images/image-unlockdoor-2.jpg",
    title: "Caring and personal consultancy processes"
  },
  {
    image: "/images/image-unlockdoor-3.jpg",
    title: "Safe and prosperous investment opportunities"
  }
]

export const UnlockingDoorsToDreams: React.FC<UnlockingDoorsToDreamsProps> = ({ 
  className = "",
  title = "UNLOCKING DOORS TO YOUR DREAMS",
  description = "Kennedy's Group brings a unique blend of real estate expertise and hospitality finesse to the forefront of the industry. With a deep understanding of both worlds, we seamlessly integrate the principles of hospitality into every aspect of our real estate ventures.",
  items = DEFAULT_ITEMS
}) => {
  return (
    <section className={`px-4 md:px-32 py-12 md:py-16 flex flex-col gap-4 md:gap-5 ${className}`}>
      <h2 className='font-haas font-light text-center text-[#172338] text-2xl md:text-4xl leading-tight md:leading-snug'>
        {title.split(' ').map((word, i, arr) => (
          <React.Fragment key={i}>
            {i > 0 && ' '}
            {word}
            {i === Math.floor(arr.length / 2) - 1 && <br className='hidden md:block' />}
          </React.Fragment>
        ))}
      </h2>
      <p className='text-center text-[#172338] font-light text-base md:text-lg mb-2 md:mb-4 font-haas px-4 md:px-0 leading-relaxed max-w-5xl mx-auto'>
        {description}
      </p>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-[1200px] mx-auto'>
        {items.map((item, index) => {
          const imageSrc = item.image || DEFAULT_ITEMS[index].image
          const finalImageSrc = imageSrc?.startsWith('/images/') 
            ? imageSrc 
            : (resolveMediaUrl(imageSrc) || imageSrc)
          
          return (
          <div key={index} className="flex flex-col gap-3 md:gap-4">
            <img 
              className='w-full h-56 object-cover' 
              src={finalImageSrc} 
              alt={item.title || DEFAULT_ITEMS[index].title}
            />
            <p className='text-left uppercase max-w-[40ch] break-words text-sm md:text-base font-light text-[#172338] font-haas leading-snug border-t border-[#D99330] pt-3'>
              {item.title || DEFAULT_ITEMS[index].title}
            </p>
          </div>
          )
        })}
      </div>
    </section>
  )
}

