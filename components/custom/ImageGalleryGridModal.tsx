"use client";
import React, { useEffect } from 'react';
import { X, Play, ChevronLeft } from 'lucide-react';
import { positionStyle } from '@/lib/utils';

interface ImageGalleryGridModalProps {
  images: string[];
  /** Reposition value per image (same index as `images`) — set in kennedys-loggia's editor. */
  imagePositions?: (string | null | undefined)[];
  videos?: string[];
  filter?: 'all' | 'videos';
  isOpen: boolean;
  onClose: () => void;
  onImageClick: (index: number) => void;
  propertyTitle?: string;
  /** Rendered as a "Go back" pill when set — keeps the offer's back link reachable while the
   * gallery modal covers the underlying page. */
  offerBackHref?: string | null;
}

export default function ImageGalleryGridModal({
  images,
  imagePositions = [],
  videos = [],
  filter = 'all',
  isOpen,
  onClose,
  onImageClick,
  propertyTitle = 'Property',
  offerBackHref = null,
}: ImageGalleryGridModalProps) {
  const visibleImages = filter === 'videos' ? [] : images;
  const [activeVideoEmbedUrl, setActiveVideoEmbedUrl] = React.useState<string | null>(null);

  const extractYoutubeId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host.includes('youtu.be')) {
        const id = parsed.pathname.split('/').filter(Boolean)[0];
        return id || null;
      }
      if (host.includes('youtube.com')) {
        const v = parsed.searchParams.get('v');
        if (v) return v;
        const parts = parsed.pathname.split('/').filter(Boolean);
        const embedIdx = parts.findIndex((p) => p === 'embed' || p === 'shorts');
        if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      }
    } catch {
      return null;
    }
    return null;
  };

  const normalizedVideos = React.useMemo(() => {
    return (videos || [])
      .map((raw) => {
        const id = extractYoutubeId(raw);
        if (!id) return null;
        return {
          rawUrl: raw,
          videoId: id,
          thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
        };
      })
      .filter(Boolean) as Array<{
      rawUrl: string;
      videoId: string;
      thumbnailUrl: string;
      embedUrl: string;
    }>;
  }, [videos]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      setActiveVideoEmbedUrl(null);
    };
  }, [isOpen, onClose]);

  if (!isOpen || (visibleImages.length === 0 && normalizedVideos.length === 0)) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
        aria-label="Close gallery"
      >
        <X size={32} />
      </button>

      {offerBackHref && (
        <a
          href={offerBackHref}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 left-4 md:left-8 z-10 flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172338]/20 text-[#172338] font-haas font-light text-sm hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-all duration-200 shadow-sm"
        >
          <ChevronLeft size={18} strokeWidth={1.5} className="text-[#D99330]" />
          Go back
        </a>
      )}

      {/* Header */}
      <div className="w-full max-w-7xl mb-6 text-center">
        <h2 className="text-white font-gtsuper-ds text-2xl md:text-4xl font-light mb-2">
          {propertyTitle} - {filter === 'videos' ? 'All Videos' : normalizedVideos.length > 0 ? 'All Photos & Videos' : 'All Photos'}
        </h2>
        <p className="text-gray-300 font-haas text-sm md:text-base">
          {filter === 'videos'
            ? `${normalizedVideos.length} ${normalizedVideos.length === 1 ? 'video' : 'videos'}`
            : `${visibleImages.length} ${visibleImages.length === 1 ? 'photo' : 'photos'}${normalizedVideos.length > 0 ? ' & videos' : ''}`}
        </p>
      </div>

      {activeVideoEmbedUrl ? (
        <div
          className="w-full max-w-6xl px-2 md:px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex justify-start">
            <button
              type="button"
              onClick={() => setActiveVideoEmbedUrl(null)}
              className="text-white border border-white/30 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
            >
              Back to gallery
            </button>
          </div>
          <div className="relative w-full overflow-hidden rounded-sm bg-black" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={activeVideoEmbedUrl}
              title={`${propertyTitle} video`}
              className="absolute left-0 top-0 h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl overflow-y-auto max-h-[85vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {normalizedVideos.map((video, index) => (
              <button
                key={`video-${video.videoId}-${index}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVideoEmbedUrl(video.embedUrl);
                }}
                className="relative aspect-square overflow-hidden rounded-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={`${propertyTitle} - Video ${index + 1}`}
                  className="no-save-image w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play size={36} className="text-white drop-shadow-md" />
                </div>
                <div className="absolute left-2 top-2 bg-black/75 text-white text-[11px] px-2 py-1 font-haas uppercase tracking-wide">
                  Video
                </div>
              </button>
            ))}

            {visibleImages.map((src, index) => (
              <button
                key={`image-${index}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(index);
                }}
                className="relative aspect-square overflow-hidden rounded-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <img
                  src={src}
                  alt={`${propertyTitle} - Image ${index + 1}`}
                  className="no-save-image w-full h-full object-cover"
                  style={positionStyle(imagePositions[index])}
                  loading="lazy"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

