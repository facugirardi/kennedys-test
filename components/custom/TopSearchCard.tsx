import React from 'react'
import { ChevronRight } from 'lucide-react'

interface TopSearchCardProps {
  title: string
  image: string
  imagePosition?: string
  propertyCount: number
  onClick?: () => void
}

export const TopSearchCard: React.FC<TopSearchCardProps> = ({
  title,
  image,
  imagePosition,
  propertyCount,
  onClick
}) => {
  return (
    <div 
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          style={{ objectPosition: imagePosition || '50% 50%' }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
      </div>
      
      <div className="mt-3">
        <h3 className="text-[#172338] text-lg md:text-xl font-gtsuper-ds font-light mb-1">
          {title}
        </h3>
        {propertyCount > 0 && (
          <p className="text-[#506A70] font-haas font-light text-xs uppercase tracking-[0.18em] mb-2">
            {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
          </p>
        )}
        <p className="text-[#B17520] font-haas font-normal text-sm inline-flex items-center gap-0.5 group-hover:underline underline-offset-4">
          <span>View Properties</span>
          <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        </p>
      </div>
    </div>
  )
}
