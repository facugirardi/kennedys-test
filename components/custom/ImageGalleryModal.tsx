"use client";
import React, { useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const SWIPE_THRESHOLD_PX = 50;

interface ImageGalleryModalProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
  /** Rendered as a "Go back" pill when set — keeps the offer's back link reachable while the
   * gallery modal covers the underlying page. */
  offerBackHref?: string | null;
}

export default function ImageGalleryModal({
  images,
  initialIndex,
  isOpen,
  onClose,
  propertyTitle = 'Property',
  offerBackHref = null,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwipe = useRef(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipe.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwipe.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX > 0) {
      handlePrevious();
    } else {
      handleNext();
    }
  }, [handlePrevious, handleNext]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handlePrevious, handleNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={() => {
        if (isSwipe.current) {
          isSwipe.current = false;
          return;
        }
        onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full"
          aria-label="Previous image"
        >
          <ChevronLeft size={40} />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full"
          aria-label="Next image"
        >
          <ChevronRight size={40} />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`${propertyTitle} - Image ${currentIndex + 1} of ${images.length}`}
          className="no-save-image max-w-full max-h-[90vh] object-contain"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-haas bg-black/50 px-4 py-2 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

