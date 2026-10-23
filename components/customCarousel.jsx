import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    // Sample image data - replace with your actual images

    const visibleThumbnails = 4;

    const nextImage = () => {
        if (selectedImage < images.length - 1) {
            setSelectedImage(selectedImage + 1);
            if (selectedImage >= startIndex + visibleThumbnails - 1) {
                setStartIndex(startIndex + 1);
            }
        }
    };

    const previousImage = () => {
        if (selectedImage > 0) {
            setSelectedImage(selectedImage - 1);
            if (selectedImage <= startIndex) {
                setStartIndex(startIndex - 1);
            }
        }
    };

    const selectImage = (index) => {
        setSelectedImage(index);
    };

    const thumbnailStyle = {
        transform: `translateX(-${startIndex * (100 / visibleThumbnails)}%)`
    };

    return (
        <div className="gallery-container">
            {/* Featured Image */}
            <div className="featured-image">
                <img
                    src={images[selectedImage]?.src}
                    alt={images[selectedImage]?.alt}
                />
            </div>

            {/* Thumbnail Navigation */}
            <div className="thumbnail-container">
                <button
                    onClick={previousImage}
                    disabled={startIndex === 0}
                    className="nav-button"
                >
                    <ChevronLeft />
                </button>

                <div className="thumbnails-wrapper">
                    <div className="thumbnails-track" style={thumbnailStyle}>
                        {images?.map((image, index) => (
                            <div
                                key={index}
                                className={`thumbnail ${selectedImage === index ? 'selected' : ''}`}
                                onClick={() => selectImage(index)}
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={nextImage}
                    disabled={startIndex >= images.length - visibleThumbnails}
                    className="nav-button"
                >
                    <ChevronRight />
                </button>
            </div>

            <style>{`
        .gallery-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .featured-image {
          position: relative;
          width: 100%;
          height: 600px;
          background-color: #f3f4f6;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .thumbnails-wrapper {
          flex: 1;
          overflow: hidden;
        }

        .thumbnails-track {
          display: flex;
          gap: 16px;
          transition: transform 0.3s ease;
        }

        .thumbnail {
          flex: 0 0 calc(25% - 12px);
          aspect-ratio: 16/9;
          cursor: pointer;
          position: relative;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .thumbnail:hover {
          opacity: 1;
        }

        .thumbnail.selected img {
          opacity: 1;
          border: 2px solid blue;
          border-radius: 4px;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .nav-button:hover {
          background-color: #f3f4f6;
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-button svg {
          width: 24px;
          height: 24px;
        }
      `}</style>
        </div>
    );
};

export default ImageGallery;