import React, { useState, useEffect, useRef } from 'react'
import { Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/utils'

interface Testimonial {
  text: string
  name: string
  occupation: string
  image: string
  rating?: number
}

interface TestimonialsSectionProps {
  className?: string
  testimonials?: Testimonial[]
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    text: "Renting through Kennedy's was the best decision we made for our Mykonos trip. The villa was stunning, the staff incredibly attentive, and every detail was taken care of before we even arrived. We will absolutely be back.",
    name: "Sophie Marceau",
    occupation: "Interior Designer, Paris",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5
  },
  {
    text: "From the first call to the last day, the team was exceptional. They found us a private villa in Ibiza that perfectly matched our vision — secluded, luxurious, and with the most breathtaking views I've ever seen.",
    name: "James Whitfield",
    occupation: "Entrepreneur, London",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    text: "Kennedy's organized our destination wedding in Tuscany and it was beyond anything we could have imagined. The concierge team handled everything flawlessly. Our guests are still talking about it months later.",
    name: "Isabella Romano",
    occupation: "Architect, Milan",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5
  }
]

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  className = "",
  testimonials = DEFAULT_TESTIMONIALS
}) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [visible, setVisible] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prev = () => { goTo((activeTestimonial - 1 + testimonials.length) % testimonials.length); startAutoplay(testimonials.length) }
  const next = () => { goTo((activeTestimonial + 1) % testimonials.length); startAutoplay(testimonials.length) }

  const goTo = (i: number) => {
    setVisible(false)
    setExpanded(false)
    timeoutRef.current = setTimeout(() => {
      setActiveTestimonial(i)
      setVisible(true)
    }, 400)
  }

  const startAutoplay = (length: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setVisible(false)
      setExpanded(false)
      timeoutRef.current = setTimeout(() => {
        setActiveTestimonial((p) => (p + 1) % length)
        setVisible(true)
      }, 400)
    }, 10000)
  }

  useEffect(() => {
    startAutoplay(testimonials.length)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [testimonials.length])

  const hasAvatar = (image?: string) =>
    !!image && !image.includes('placehold.co') && image.trim() !== ''

  const truncate = (text: string, words = 30) => {
    const arr = text.split(' ')
    return arr.length <= words ? text : arr.slice(0, words).join(' ') + '...'
  }

  return (
    <section className={`relative w-full pb-12 pt-20 px-4 md:pb-16 md:pt-28 md:px-0 ${className}`}>
      <h2 className="text-center font-gtsuper-ds text-[28px] md:text-[48px] font-thin leading-tight text-[#506A70]">
        What people says about us
      </h2>

      {/* Gradientes para que los laterales se desvanezcan hasta los bordes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent hidden md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent hidden md:block" />

      {/* 3 columnas, centro más ancho */}
      <div className="mx-0 mt-6 grid grid-cols-1 items-start gap-6 md:mt-[74px] md:[grid-template-columns:1fr_minmax(0,1.6fr)_1fr]">
        {/* Izquierda ghost */}
        {(() => {
          const t = testimonials[(activeTestimonial - 1 + testimonials.length) % testimonials.length]
          const src = t.image?.startsWith('/images/') || t.image?.startsWith('http') ? t.image : (resolveMediaUrl(t.image) || t.image)
          return (
            <div className="pointer-events-none select-none px-6 opacity-25 hidden md:flex md:flex-col md:items-center">
              <div className="relative h-[300px] flex flex-col justify-center items-center translate-y-[10px]">
                <p className="w-full text-center font-gtsuper-ds text-[14px] md:text-[20px] px-2 font-thin leading-tight text-[#506A70] blur-[0.5px] min-h-[120px] flex items-center justify-center">
                  {truncate(t.text)}
                </p>
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#28F7EA] text-[#28F7EA]" />)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                {hasAvatar(t.image) && <img src={src} className="h-16 w-16 rounded-full mb-2" alt={t.name} />}
                <div className="text-center">
                  <div className="font-gtsuper-ds text-[18px] font-thin text-[#172338]">{t.name}</div>
                  <div className="font-haas text-[14px] font-thin text-[#7C8D93]">{t.occupation}</div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Centro */}
        <div className="relative mx-auto w-full max-w-[980px] px-2 md:px-4">
          <div className="relative flex flex-col justify-center md:min-h-[300px]">
            <div className="absolute left-0 top-0 hidden h-full w-px bg-[#9DB0B6] md:block" />
            <div className="absolute right-0 top-0 hidden h-full w-px bg-[#9DB0B6] md:block" />

            <div
              className="transition-all duration-500 ease-in-out"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)' }}
            >
              {(() => {
                const fullText = testimonials[activeTestimonial].text
                const words = fullText.split(' ')
                const isLong = words.length > 30
                return (
                  <div className="flex flex-col items-center px-2 md:px-14">
                    <p className={`text-center font-gtsuper-ds text-[16px] md:text-[26px] font-thin leading-tight text-[#506A70] ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
                      {fullText}
                    </p>
                    {isLong && (
                      <button
                        onClick={() => setExpanded((v) => !v)}
                        className="mt-2 text-[#9DB0B6] hover:text-[#506A70] transition-colors"
                        aria-label={expanded ? 'Show less' : 'Show more'}
                      >
                        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    )}
                  </div>
                )
              })()}

              {/* Estrellas turquesa */}
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: testimonials[activeTestimonial].rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#28F7EA] text-[#28F7EA]" />
                ))}
              </div>
            </div>
          </div>

          {/* Avatar (optional), nombre, ocupación */}
          <div
            className="mt-2 flex flex-col items-center transition-all duration-500 ease-in-out md:mt-4"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)' }}
          >
            {(() => {
              const testimonial = testimonials[activeTestimonial]
              const imageSrc = testimonial.image?.startsWith('/images/') || testimonial.image?.startsWith('http')
                ? testimonial.image
                : (resolveMediaUrl(testimonial.image) || testimonial.image)
              return hasAvatar(testimonial.image) ? (
                <img src={imageSrc} alt={testimonial.name} className="h-16 w-16 rounded-full mb-2" />
              ) : null
            })()}
            <div className="text-center">
              <div className="font-gtsuper-ds text-[18px] font-thin text-[#172338]">
                {testimonials[activeTestimonial].name}
              </div>
              <div className="font-haas text-[14px] font-thin text-[#7C8D93]">
                {testimonials[activeTestimonial].occupation}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-center gap-4 md:mt-8 md:translate-y-[20px]">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="text-[#9DB0B6] hover:text-[#506A70] transition-colors"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>

            <input
              type="range"
              min={0}
              max={testimonials.length - 1}
              value={activeTestimonial}
              onChange={(e) => { goTo(Number(e.target.value)); startAutoplay(testimonials.length) }}
              className="testimonial-slider w-36"
              style={{
                background: testimonials.length > 1
                  ? `linear-gradient(to right, #D9964A 0%, #D9964A ${(activeTestimonial / (testimonials.length - 1)) * 100}%, #D1D8DB ${(activeTestimonial / (testimonials.length - 1)) * 100}%, #D1D8DB 100%)`
                  : '#D9964A'
              }}
            />

            <span className="font-haas text-[11px] tracking-widest text-[#9DB0B6] tabular-nums">
              {String(activeTestimonial + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(testimonials.length).padStart(2, '0')}
            </span>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="text-[#9DB0B6] hover:text-[#506A70] transition-colors"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Leave a review CTA */}
          <div className="mt-8 flex justify-center md:mt-10 md:translate-y-[20px]">
            <a
              href="https://g.page/r/CYID1mW0rMwrEAE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-[#506A70] px-7 py-3 font-haas text-[11px] tracking-[0.2em] uppercase text-[#506A70] transition-colors duration-300 hover:bg-[#506A70] hover:text-white"
            >
              <Star className="h-3 w-3 fill-[#506A70] text-[#506A70] transition-all duration-300 group-hover:fill-white group-hover:text-white group-hover:rotate-[72deg]" />
              Leave your review
            </a>
          </div>
        </div>

        {/* Derecha ghost */}
        {(() => {
          const t = testimonials[(activeTestimonial + 1) % testimonials.length]
          const src = t.image?.startsWith('/images/') || t.image?.startsWith('http') ? t.image : (resolveMediaUrl(t.image) || t.image)
          return (
            <div className="pointer-events-none select-none px-6 opacity-25 hidden md:flex md:flex-col md:items-center">
              <div className="relative h-[300px] flex flex-col justify-center items-center translate-y-[10px]">
                <p className="w-full text-center font-gtsuper-ds text-[14px] md:text-[20px] px-2 font-thin leading-tight text-[#506A70] blur-[0.5px] min-h-[120px] flex items-center justify-center">
                  {truncate(t.text)}
                </p>
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#28F7EA] text-[#28F7EA]" />)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                {hasAvatar(t.image) && <img src={src} className="h-16 w-16 rounded-full mb-2" alt={t.name} />}
                <div className="text-center">
                  <div className="font-gtsuper-ds text-[18px] font-thin text-[#172338]">{t.name}</div>
                  <div className="font-haas text-[14px] font-thin text-[#7C8D93]">{t.occupation}</div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </section>
  )
}

