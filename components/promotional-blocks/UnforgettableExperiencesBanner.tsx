import React from 'react'
import { resolveMediaUrl } from '@/lib/utils'

interface UnforgettableExperiencesBannerProps {
  className?: string
  image?: string
  text?: string
  data?: {
    image?: string
    text?: string
  }
}

const DEFAULT_IMAGE = '/images/events-exp.png'
const DEFAULT_TEXT = "UNFORGETTABLE EXPERIENCES THAT REFLECT YOUR UNIQUE VISION"

export const UnforgettableExperiencesBanner: React.FC<UnforgettableExperiencesBannerProps> = ({
  className = "",
  image,
  text,
  data
}) => {
  const finalImage = data?.image ? resolveMediaUrl(data.image) : (image || DEFAULT_IMAGE)
  const finalText = data?.text || text || DEFAULT_TEXT
  return (
    <section className={`w-full h-[260px] md:h-[450px] relative ${className}`}>
      <img 
        src={finalImage} 
        className='w-full h-full object-cover' 
        alt="Unforgettable Experiences"
      />
      <p className='absolute top-6 md:top-20 left-4 md:left-24 text-[#172338] font-gtsuper-ds font-light text-2xl md:text-5xl'>
        {finalText.split(' ').map((word, i, arr) => (
          <React.Fragment key={i}>
            {word}
            {(i === 1 || i === 4) && <br className='hidden md:block' />}
            {i < arr.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>
    </section>
  )
}

