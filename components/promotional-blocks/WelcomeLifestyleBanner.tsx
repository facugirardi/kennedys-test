import React from 'react'

interface WelcomeLifestyleBannerProps {
  className?: string
  data?: {
    title?: string
    subtitle?: string
    buttonText?: string
    buttonLink?: string
  }
}

export const WelcomeLifestyleBanner: React.FC<WelcomeLifestyleBannerProps> = ({ className = "", data }) => {
  const title = data?.title || "WELCOME TO THE KENNEDY'S GROUP LIFESTYLE"
  const subtitle = data?.subtitle || "WHERE WE PROMISE TO MEET YOUR HIGHEST EXPECTATIONS!"
  const buttonText = data?.buttonText || "MEET OUR TEAM"
  const buttonLink = data?.buttonLink

  return (
    <section className={`w-full bg-[#172338] py-16 md:py-32 text-center text-white mb-10 md:mb-0 ${className}`}>
      <div className="mx-auto max-w-[1100px] px-6">
        <h3 className="font-gtsuper-ds text-2xl md:text-4xl font-light tracking-wide">
          {title}
        </h3>
        <h4 className="font-gtsuper-ds text-2xl md:text-4xl font-light tracking-[0.06em] text-[#D7A35E]">
          {subtitle}
        </h4>
        {buttonLink ? (
          <a href={buttonLink} className="mt-3 font-gtsuper-ds text-[18px] uppercase tracking-[0.16em] text-[#DADFE3] hover:text-white transition-colors inline-block">
            {buttonText}
          </a>
        ) : (
          <button className="mt-3 font-gtsuper-ds text-[18px] uppercase tracking-[0.16em] text-[#DADFE3] hover:text-white transition-colors">
            {buttonText}
          </button>
        )}
      </div>
    </section>
  )
}

