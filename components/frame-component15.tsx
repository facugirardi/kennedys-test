import type { NextPage } from "next";
import { useState, useCallback } from "react";
import Contact from "./contact"
import PortalPopup from "./portal-popup"
import styles from "./frame-component15.module.css"

export type FrameComponent15Type = {
  className?: string;
};

const FrameComponent15: NextPage<FrameComponent15Type> = ({
  className = "",
}) => {
  const [isContactOpen, setContactOpen] = useState(false);

  const openContact = useCallback(() => {
    setContactOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  return (
    <>
      <section className={[styles.servicesContentWrapper, className].join(" ")}>
        <div className={styles.servicesContent}>
          <div className={styles.servicesGrid}>
            <div className={styles.servicesGridChild} />
            <div className={styles.serviceDescription}>
              <h1 className={styles.personalizedItinerariesAnd}>
                Personalized itineraries and bookings
              </h1>
              <div className={styles.experienceLuxuryAtContainer}>
                <p className={styles.experienceLuxuryAt}>
                  Experience luxury at its finest with our range of Concierge
                  Packages tailored to meet your every need. Choose from our
                </p>
                <p className={styles.star6StarAnd7StarPacka}>
                  <span className={styles.star6StarAnd}>
                    5-star, 6-star, and 7-star packages,
                  </span>
                  <span className={styles.eachOfferingA}>
                    {" "}
                    each offering a unique blend of services to ensure an
                    unforgettable experience.
                  </span>
                </p>
              </div>
            </div>
            {/* <img
              className={styles.servicesGridItem}
              alt=""
              src="/rectangle-52@2x.png"
            /> */}
            <img
              className={styles.servicesGridInner}
              loading="lazy"
              alt=""
              src="/rectangle-65@2x.png"
            />
            <img
              className={styles.rectangleIcon}
              alt=""
              src="/rectangle-66@2x.png"
            />
          </div>
          <div className={styles.row}>
            <div className={styles.block}>
              <h3 className={styles.stars}>5 Stars</h3>
              <div className={styles.indulgeInA}>
                Indulge in a stress-free getaway with personalized itinerary
                planning, VIP access, and seamless coordination of your travel
                needs.
              </div>
            </div>
            <div className={styles.block}>
              <h3 className={styles.stars1}>6 stars</h3>
              <div className={styles.indulgeInA}>
                Elevate your experience with enhanced services, including 24/7
                dedicated concierge support, expedited access, and prime seating
                at top venues and events.
              </div>
            </div>
            <div className={styles.block}>
              <h3 className={styles.stars2}>7 stars</h3>
              <div className={styles.indulgeInA}>
                Reach for the sky with our most exclusive package, offering
                unlimited changes to your itinerary, personalized assistance
                throughout your stay, and access to the most coveted experiences
                and venues worldwide.
              </div>
            </div>
          </div>
          <h1 className={styles.noMatterWhichContainer}>
            <p
              className={styles.star6StarAnd7StarPacka}
            >{`No matter which package you choose, `}</p>
            <p className={styles.star6StarAnd7StarPacka}>
              our team guarantees an exceptional experience
            </p>
          </h1>
          <button className={styles.buttons} onClick={openContact}>
            <div className={styles.label}>Contact Now</div>
            <img className={styles.vectorIcon} alt="" src="/vector.svg" />
          </button>
        </div>
      </section>
      {isContactOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeContact}
        >
          <Contact onClose={closeContact} />
        </PortalPopup>
      )}
    </>
  );
};

export default FrameComponent15;
