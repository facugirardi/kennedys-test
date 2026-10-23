import React from 'react'
import { resolveMediaUrl } from '@/lib/utils'

interface ListYourPropertyBannerProps {
  className?: string
  data?: {
    title?: string
    paragraphs?: string[]
    buttonText?: string
    buttonLink?: string
    image?: string
  }
}

const DEFAULT_TITLE = "List Your Property With Kennedy's Group"

const DEFAULT_PARAGRAPHS = [
  "Exceptional homes deserve exceptional representation. At Kennedy's Group, we don't simply rent properties; we position, present, and manage them with the care, discretion, and attention they deserve.",
  "By joining our curated portfolio, your home becomes part of a trusted luxury network, supported by our expertise in villa rentals, concierge, guest experience, and high-end hospitality.",
  "Let us introduce your property to the right clients, protect its value, and turn every stay into a seamless Kennedy's Group experience.",
]

const DEFAULT_BUTTON_TEXT = 'List Your Property'

// TODO: replace with the final photo asset — currently a grayscale placeholder.
const DEFAULT_IMAGE = '/images/pool-with-ocean-image.png'

const DEFAULT_BUTTON_LINK = '/we-manage-your-property'

export const ListYourPropertyBanner: React.FC<ListYourPropertyBannerProps> = ({ className = '', data }) => {
  const title = data?.title || DEFAULT_TITLE
  const paragraphs = data?.paragraphs?.length ? data.paragraphs : DEFAULT_PARAGRAPHS
  const buttonText = data?.buttonText || DEFAULT_BUTTON_TEXT
  const buttonLink = data?.buttonLink || DEFAULT_BUTTON_LINK
  const imageSrc = data?.image
    ? (data.image.startsWith('/images/') ? data.image : (resolveMediaUrl(data.image) || data.image))
    : DEFAULT_IMAGE

  return (
    <section className={`w-full mt-[90px] ${className}`}>
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col justify-center gap-5 bg-[#F0F3F5] px-6 py-12 md:w-1/2 md:px-14 md:py-20 lg:px-20">
          <h2 className="font-gtsuper-ds text-2xl font-light uppercase tracking-[0.08em] text-[#172338] md:text-4xl">
            {title}
          </h2>
          <div className="flex flex-col gap-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="font-haas text-sm font-light leading-relaxed text-[#172338] md:text-base md:leading-[1.65]">
                {paragraph}
              </p>
            ))}
          </div>
          <a
            href={buttonLink}
            className="mt-1 inline-flex w-fit items-center justify-center bg-[#172338] px-7 py-3.5 font-haas text-sm uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
          >
            {buttonText}
          </a>
        </div>
        <div className="relative h-[280px] w-full md:h-auto md:w-1/2">
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
