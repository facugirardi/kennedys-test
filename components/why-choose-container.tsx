import type { NextPage } from "next";
import { useRef, useState, useCallback } from "react";

export type WhyChooseContainerType = {
  className?: string;
};

const cards = [
  {
    image: "/images/why_choose_driver.png",
    title: "Best Rates",
    description: "We can guarantee you the best possible rates.",
    gold: false,
  },
  {
    image: "/images/why_choose_availability.png",
    title: "24/7 Availability",
    description: "Dedicated driver available around the clock.",
    gold: false,
  },
  {
    image: "/images/why_choose_professional.png",
    title: "Professional Drivers",
    description: "Our drivers are highly trained, extremely reliable, and utterly discreet.",
    gold: true,
  },
  {
    image: "/images/why_choose_english.png",
    title: "English Speakers",
    description: "Our drivers speak very good English, so misunderstandings are out of the question when dealing with us.",
    gold: false,
  },
];

const WhyChooseContainer: NextPage<WhyChooseContainerType> = ({ className = "" }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }, []);

  return (
    <section className={`w-full pt-16 md:pt-24 pb-0 -mb-10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex flex-col items-center gap-9 text-center px-4 md:px-24 mb-12 md:mb-20">
        <h2 className="font-gtsuper-ds font-light text-3xl md:text-5xl text-[#172338] tracking-tight">
          Why choose our services
        </h2>
        <p className="font-haas text-[18px] font-thin text-[#506A70] leading-relaxed max-w-2xl">
          Our concierge services offer unparalleled luxury and personalized attention. From bespoke
          itineraries and 24/7 support to exclusive access and seamless coordination, we ensure every
          detail is expertly managed to provide you with a truly exceptional experience.
        </p>
      </div>

      {/* Mobile: carousel */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex-none w-full snap-center px-4 flex flex-col gap-3"
            >
              <img src={card.image} alt={card.title} className="w-full h-64 object-cover" />
              <div>
                <p className={`font-gtsuper-ds text-[18px] uppercase tracking-[0.04em] font-normal ${card.gold ? "text-[#D99330]" : "text-[#506A70]"}`}>
                  {card.title}
                </p>
                <p className="font-haas text-sm text-[#506A70] leading-relaxed mt-1">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5 mb-10">
          {cards.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                scrollRef.current?.scrollTo({ left: scrollRef.current.clientWidth * i, behavior: "smooth" });
                setActiveIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? "bg-[#D99330]" : "bg-[#C4C4C4]"}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: collage — alternating high/low positions, overlapping, centered */}
      <div className="hidden md:flex justify-center px-16">
      <div className="relative" style={{ height: 560, width: 1290 }}>
        {/* Card 1 — top-left, tallest */}
        <div className="absolute flex flex-col gap-3" style={{ left: 0, top: 0, width: 350 }}>
          <img
            src="/images/why_choose_driver.png"
            alt="Best Rates"
            className="object-cover"
            style={{ width: 350, height: 304 }}
          />
          <div className="flex flex-col gap-[2px]">
            <p className="font-gtsuper-ds text-[18px] uppercase tracking-[0.04em] text-[#506A70] font-normal">
              Best Rates
            </p>
            <p className="font-haas text-[14px] font-thin text-[#506A70] leading-relaxed max-w-[300px]">
              We can guarantee you the best possible rates.
            </p>
          </div>
        </div>

        {/* Card 2 — overlaps card 1, shifted down */}
        <div className="absolute flex flex-col gap-3" style={{ left: 310, top: 190, width: 346 }}>
          <img
            src="/images/why_choose_availability.png"
            alt="24/7 Availability"
            className="object-cover"
            style={{ width: 346, height: 186 }}
          />
          <div className="flex flex-col gap-[2px]">
            <p className="font-gtsuper-ds text-[18px] uppercase tracking-[0.04em] text-[#506A70] font-normal">
              24/7 Availability
            </p>
            <p className="font-haas text-[14px] font-thin text-[#506A70] leading-relaxed max-w-[300px]">
              Dedicated driver available around the clock.
            </p>
          </div>
        </div>

        {/* Card 3 — overlaps card 2, back to top, gold title */}
        <div className="absolute flex flex-col gap-3" style={{ left: 620, top: -26, width: 350 }}>
          <img
            src="/images/why_choose_professional.png"
            alt="Professional Drivers"
            className="object-cover"
            style={{ width: 350, height: 180 }}
          />
          <div className="flex flex-col gap-[2px] ml-[60px]">
            <p className="font-gtsuper-ds text-[18px] uppercase tracking-[0.04em] text-[#D99330] font-normal">
              Professional<br />Drivers
            </p>
            <p className="font-haas text-[14px] font-thin text-[#506A70] leading-relaxed max-w-[220px]">
              Our drivers are highly trained, extremely reliable, and utterly discreet.
            </p>
          </div>
        </div>

        {/* Card 4 — overlaps card 3, shifted down */}
        <div className="absolute flex flex-col gap-3" style={{ left: 940, top: 110, width: 350 }}>
          <img
            src="/images/why_choose_english.png"
            alt="English Speakers"
            className="object-cover"
            style={{ width: 350, height: 203 }}
          />
          <div className="flex flex-col gap-[2px]">
            <p className="font-gtsuper-ds text-[18px] uppercase tracking-[0.04em] text-[#506A70] font-normal">
              English Speakers
            </p>
            <p className="font-haas text-[14px] font-thin text-[#506A70] leading-relaxed max-w-[300px]">
              Our drivers speak very good English, so misunderstandings are out of the question when dealing with us.
            </p>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default WhyChooseContainer;
