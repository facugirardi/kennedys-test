import React from 'react';
import { resolveMediaUrl } from '@/lib/utils';
import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml';

interface OutdoorSpacesSectionProps {
  outdoorTitle?: string | null;
  outdoorDescription?: string | null;
  outdoorImage?: string | null;
}

export const OutdoorSpacesSection: React.FC<OutdoorSpacesSectionProps> = ({
  outdoorTitle,
  outdoorDescription,
  outdoorImage,
}) => {
  // Si no hay título, no mostrar el componente
  if (!outdoorTitle) {
    return null;
  }

  const imageUrl = outdoorImage 
    ? resolveMediaUrl(outdoorImage) 
    : null;

  return (
    <section className='w-full px-4 md:px-32 flex flex-col md:flex-row h-auto md:h-[24rem] bg-[#172338] relative overflow-visible my-12 md:my-20'>
      <div className='flex justify-center items-center w-full md:w-full py-8 md:py-0 z-10 md:pr-[20%]'>
        <div className='flex flex-col gap-5 w-full text-balance px-4 md:px-0'>
          {outdoorTitle && (
            <h2 className="text-2xl md:text-[40px] font-gtsuper-ds font-light text-white leading-[103%] tracking-[-0.02em]">
              {outdoorTitle}
            </h2>
          )}
          {outdoorDescription && (
            <div 
              className="text-white text-base md:text-[16px] font-haas leading-[140%] tracking-[0.02em] prose prose-invert prose-p:text-white prose-p:my-2 [&_ul]:list-none [&_li]:list-none [&_ul]:p-0 [&_li]:p-0"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(outdoorDescription) }}
            />
          )}
        </div>
      </div>
      {imageUrl && (
        <div className='w-full md:w-[40%] md:mr-[3%] h-[300px] md:h-[28rem] md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2'>
          <img 
            src={imageUrl} 
            alt={outdoorTitle || 'Outdoor spaces'} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}
    </section>
  );
};

