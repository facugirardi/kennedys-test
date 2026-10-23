import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useState } from 'react'


interface ImagesCarrouselProps {
    images: { urlImage: string; section?: string }[];
    type: string;
    handleOpenGallery: () => void;
}

export const ImagesCarrousel = ({ images, type, handleOpenGallery }: ImagesCarrouselProps) => {
    const [activeImage, setActiveImage] = useState(0);
    const imagesByType = images.filter((image) => image.section === type);

    const handleNextImage = () => {
        setActiveImage((prev) => (prev + 1) % imagesByType.length);
    };

    const handlePrevImage = () => {
        setActiveImage((prev) => (prev - 1 + imagesByType.length) % imagesByType.length);
    };

    return (
        <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
            <button className="absolute top-2 right-2 p-2 rounded-full bg-white" onClick={handleOpenGallery}>
                <X size={20} className="text-black" />
            </button>

            <div className="relative flex items-center justify-center gap-10 w-[900px] h-[600px]">
                <button onClick={handlePrevImage} className="absolute left-0 z-20">
                    <ChevronLeft size={50} className="text-white" />
                </button>

                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                        src={`${process.env.NEXT_PUBLIC_BASE_URL}${imagesByType[activeImage]?.urlImage}`}
                        alt={type}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>

                <button onClick={handleNextImage} className="absolute right-0 z-20">
                    <ChevronRight size={50} className="text-white" />
                </button>
            </div>
        </div>
    );
};
