import React from 'react';
import { Button } from './ui/button1'
import { useRouter } from 'next/router';
import { slugify } from '@/lib/utils';

interface EventCardProps {
  title: string;
  description: string;
  image?: string;
  variant: 'left-image' | 'right-image';
  eventId?: string;
  isEventDetail?: boolean;
}

export default function EventCard({
  title,
  description,
  image,
  variant,
  eventId,
  isEventDetail = false
}: EventCardProps) {
  const router = useRouter();

  const handleMoreInfo = () => {
    if (title) {
      const slug = slugify(title);
      router.push(`/events/${slug}`);
    } else if (eventId) {
      // Fallback to ID for backward compatibility
      router.push(`/events/${eventId}`);
    }
  };
  return (
    <div className={`flex gap-8 ${variant === 'right-image' ? 'flex-row-reverse' : ''}`}>
      {image && (
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL}${image}`}
          alt={title}
          className="w-[635px] h-[364px] object-cover flex-shrink-0"
        />
      )}
      <div className="flex flex-col gap-5 items-start flex-1">
        <div className={`text-6xl font-bold bg-white border-b-[0.5px] border-soft-gray-dark ${isEventDetail ? 'text-[#506A70]' : 'text-primary'}`}>
          <h1 className={`bg-white py-5 ${variant === 'right-image' ? 'translate-x-20' : '-translate-x-20'}`}>
            {title}
          </h1>
        </div>
        <p className="text-soft-gray-dark leading-relaxed">
          {description}
        </p>
        <Button
          variant="ghost"
          className="underline text-soft-gray-dark font-bold px-0"
          onClick={handleMoreInfo}
        >
          More info
        </Button>
      </div>
    </div>
  );
}
