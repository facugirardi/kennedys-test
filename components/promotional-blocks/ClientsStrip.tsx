import React from 'react'
import { resolveMediaUrl } from '@/lib/utils'

interface ClientsStripProps {
  className?: string
  title?: string
  image?: string
  data?: {
    title?: string
    image?: string
  }
}

const DEFAULT_IMAGE = "/images/clients-image.png"
const DEFAULT_TITLE = "Our Clients"

export const ClientsStrip: React.FC<ClientsStripProps> = ({
  className = "",
  title,
  image,
  data
}) => {
  const finalTitle = data?.title || title || DEFAULT_TITLE
  const finalImage = data?.image ? resolveMediaUrl(data.image) : (image || DEFAULT_IMAGE)
  return (
    <section className={`relative bg-[#F9FAFA] py-14 px-10 ${className}`}>
      <h2 className="text-center font-thin font-gtsuper-ds text-4xl mb-20 text-[#506A70]">{finalTitle}</h2>
      <div className="flex items-center justify-center">
        <img 
          src={finalImage} 
          alt={finalTitle} 
          className="absolute pb-10 w-[1020px] max-w-full" 
        />
      </div>
    </section>
  )
}

