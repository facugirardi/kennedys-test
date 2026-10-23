import React from 'react'
import { resolveMediaUrl } from '@/lib/utils'

interface NewsItem {
  id?: string
  image?: string
  title: string
  description?: string
  link?: string
  avatarUrl?: string
  extra?: {
    link?: string
  }
}

interface WeAreOnTheNewsProps {
  news?: NewsItem[]
  fallbackNews?: NewsItem[]
  className?: string
  blockData?: {
    newsItems?: NewsItem[]
    title?: string
  }
}

const FALLBACK_NEWS: NewsItem[] = [
  { title: "Holiday organised exactly according to your desires", avatarUrl: "/images/rectangle-39-1@2x.png" },
  { title: "Holiday organised exactly according to your desires", avatarUrl: "/images/rectangle-39-2@2x.png" },
  { title: "Holiday organised exactly according to your desires", avatarUrl: "/images/rectangle-39-3@2x.png" },
]

function NewsCard({ img, title, description, link }: { img: string; title: string; description?: string; link?: string }) {
  const displayTitle = description || title
  
  return (
    <article className="group">
      <div className="aspect-[3/2] w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="max-w-[80%] font-haas text-[16px] md:text-[18px] font-light leading-6 text-[#5A6B73] md:text-[#506A70]">{displayTitle}</p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#96A6AE] md:border-[#506A70] text-[#96A6AE] md:text-[#506A70] hover:bg-[#506A70] hover:text-white transition-colors"
            aria-label="Read more"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full border border-[#96A6AE] md:border-[#506A70] text-[#96A6AE] md:text-[#506A70]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </article>
  )
}

export const WeAreOnTheNews: React.FC<WeAreOnTheNewsProps> = ({ 
  news = [], 
  fallbackNews = FALLBACK_NEWS,
  className = "",
  blockData
}) => {
  // Si hay blockData, usar newsItems del bloque, sino usar news prop o fallback
  const newsFromBlock = blockData?.newsItems && Array.isArray(blockData.newsItems) ? blockData.newsItems : null;
  const displayNews = newsFromBlock || (news.length > 0 ? news : fallbackNews)

  return (
    <section className={`mx-auto w-full max-w-[1160px] md:max-w-[1300px] px-5 py-14 mb-10 mt-10 ${className}`}>
      <h3 className="mb-6 text-center font-light font-gtsuper-ds text-3xl md:text-4xl text-[#3B4B53]">
        {blockData?.title || "We are on the news"}
      </h3>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {displayNews.map((item: NewsItem, idx: number) => {
          const rawImg = item.image || item.avatarUrl || ''
          const img = rawImg?.startsWith('/images/') 
            ? rawImg 
            : (rawImg ? resolveMediaUrl(rawImg) : '/images/rectangle-39-1@2x.png')
          const link = item.link || item.extra?.link
          
          return (
            <NewsCard 
              key={item.id || idx} 
              img={img}
              title={item.title || 'News item'} 
              description={item.description}
              link={link}
            />
          )
        })}
      </div>
    </section>
  )
}

