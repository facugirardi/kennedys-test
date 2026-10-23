import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ChevronsRight } from 'lucide-react';
import OlgaImage from '@/public/images/olgaImage.jpg';
import DianaImage from '@/public/images/dianaImage.jpg';
import NikiImage from '@/public/images/niki.jpg';
import { contactPresetFromPathname } from '@/lib/contactInquiryTypes';
import { useContact } from '@/src/contexts/ContactContext';
import { cn } from '@/lib/utils';

const WHATSAPP_NUMBERS: Record<string, string> = {
  VILLA_RENTALS: '306972152778',
  CONCIERGE: '306980960538',
  EVENTS: '306980960538',
  REAL_ESTATE: '306978137391',
};

const WHATSAPP_MESSAGES: Record<string, string> = {
  VILLA_RENTALS: "Hello, I'm interested in a vacation rental.",
  CONCIERGE: "Hello, I'm interested in concierge services.",
  EVENTS: "Hello, I'm interested in event planning services.",
  REAL_ESTATE: "Hello, I'm interested in a real estate property.",
};

import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext';

type FloatingContactButtonProps = {
  /** Raise the button on small screens when the cookie bar is visible so it stays tappable */
  liftForCookieBanner?: boolean;
};

export function FloatingContactButton({ liftForCookieBanner = false }: FloatingContactButtonProps) {
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const router = useRouter();
  const { propertyTitle } = useContact();
  const [collapsed, setCollapsed] = useState(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setCollapsed(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        setCollapsed(false);
      }, 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const isRealEstate = router.pathname.startsWith('/real-estate');
  const isConcierge = router.pathname.startsWith('/concierge');
  const isEvents = router.pathname.startsWith('/events');
  const agentImage = isRealEstate ? DianaImage : (isConcierge || isEvents) ? NikiImage : OlgaImage;

  const handleClick = useCallback(() => {
    const preset = contactPresetFromPathname(router.pathname) ?? 'VILLA_RENTALS';
    const phone = WHATSAPP_NUMBERS[preset] ?? '306972152778';
    const baseMsg = WHATSAPP_MESSAGES[preset] ?? "Hello, I'm interested in Kennedy's Group services.";
    let msg = baseMsg;
    if (propertyTitle) {
      if (preset === 'CONCIERGE') msg = `Hello, I'm interested in the concierge service ${propertyTitle}.`;
      else if (preset === 'EVENTS') msg = `Hello, I'm interested in the event ${propertyTitle}.`;
      else msg = `Hello, I'm interested in the property ${propertyTitle}.`;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, [router.pathname, propertyTitle]);

  if (isAgentPortfolioSite) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'fixed right-5 z-50 flex items-center bg-[#506A70] rounded-full shadow-lg hover:bg-[#3d5459] transition-all duration-500 ease-in-out overflow-hidden',
        liftForCookieBanner ? 'bottom-32 transition-[bottom] duration-300 sm:bottom-36 md:bottom-5' : 'bottom-5'
      )}
      style={{ padding: collapsed ? '6px' : '6px 16px 6px 6px' }}
      aria-label="Contact Our Agent"
    >
      <img
        src={agentImage.src}
        alt="Kennedy's Agent"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        style={{ objectPosition: (isConcierge || isEvents) ? 'center -4px' : 'center top' }}
      />
      <span
        className="flex items-center gap-2 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap"
        style={{ maxWidth: collapsed ? '0px' : '200px', opacity: collapsed ? 0 : 1, marginLeft: collapsed ? '0px' : '10px' }}
      >
        <span className="font-haas text-white font-light text-sm">
          Contact Our Agent
        </span>
        <ChevronsRight size={18} className="text-white flex-shrink-0" />
      </span>
    </button>
  );
}
