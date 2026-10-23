import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './serviceCarousel.module.css'@/components/custom/from './serviceCarousel.module.css;
import InquiryModal from './bookNow'@/components/custom/from './bookNow;

const ServicesCarousel = ({ services }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const showNavigation = services.length > 4;
    const [bookNowModal, setBookNowModal] = useState(false)
    const nextSlide = () => {
        if (!showNavigation) return;
        setCurrentIndex((prev) => {
            const nextIndex = prev + 1;
            return nextIndex >= services.length ? 0 : nextIndex;
        });
    };

    const prevSlide = () => {
        if (!showNavigation) return;
        setCurrentIndex((prev) => {
            const prevIndex = prev - 1;
            return prevIndex < 0 ? services.length - 1 : prevIndex;
        });
    };

    const getVisibleServices = () => {
        if (services.length <= 4) return services;

        let visibleItems = [];
        for (let i = 0; i < 4; i++) {
            const index = (currentIndex + i) % services.length;
            visibleItems.push(services[index]);
        }
        return visibleItems;
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Our global services</h2>

            <div className={styles.wrapper}>
                <div className={styles.track}>
                    {getVisibleServices().map((service, index) => (
                        <Link
                            href={service.link}
                            key={`${service.name}-${index}`}
                            className={styles.item}
                        >
                            <div className={styles.imageContainer}>
                                <Image
                                    src={service.imageUrl}
                                    alt={service.name}
                                    fill
                                    className={styles.image}
                                />
                                <div className={styles.overlay} />
                                <h3 className={styles.serviceTitle}>
                                    {service.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>

                {showNavigation && (
                    <>
                        <button
                            onClick={prevSlide}
                            className={styles.prevButton}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft width={24} height={24} />
                        </button>

                        <button
                            onClick={nextSlide}
                            className={styles.nextButton}
                            aria-label="Next slide"
                        >
                            <ChevronRight width={24} height={24} />
                        </button>
                    </>
                )}
            </div>

            <div className={styles.contactContainer}>
                <button
                    className={styles.contactButton}
                    onClick={() => setBookNowModal(true)}
                >
                    Contact Now
                    <ChevronRight width={16} height={16} />
                </button>
            </div>

            <InquiryModal isOpen={bookNowModal} onClose={() => setBookNowModal(false)} />
        </div>
    );
};

export default ServicesCarousel;