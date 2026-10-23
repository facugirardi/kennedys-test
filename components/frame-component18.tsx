import type { NextPage } from "next";
import { useState, useCallback } from "react";
import Contact from "./contact"
import PortalPopup from "./portal-popup"
import styles from "./frame-component18.module.css"

export type FrameComponent18Type = {
  className?: string;
};

const FrameComponent18: NextPage<FrameComponent18Type> = ({
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
      <section className={[styles.whyWeStandOutParent, className].join(" ")}>
        <h1 className={styles.whyWeStand}>Why We Stand Out</h1>
        <div className={styles.row}>
          <div className={styles.block}>
            <h3 className={styles.tailoredApproach}>Tailored Approach</h3>
            <div className={styles.weUnderstandThat}>
              We understand that every event is unique, which is why we tailor
              our services to meet your specific needs and preferences, ensuring
              a truly personalized experience.
            </div>
          </div>
          <div className={styles.block}>
            <h3 className={styles.creativeVision}>Creative Vision</h3>
            <div className={styles.ourTeamIs}>
              Our team is dedicated to bringing your vision to life, whether
              it's a fairy-tale wedding or a themed party. We go above and
              beyond to create unforgettable experiences that leave a lasting
              impression.
            </div>
          </div>
          <div className={styles.block}>
            <h3 className={styles.creativeVision}>Creative Vision</h3>
            <div className={styles.ourTeamIs}>
              From the moment you contact us until the last guest leaves, we pay
              meticulous attention to every detail to ensure that your event is
              flawless and exceeds your expectations.
            </div>
          </div>
          <div className={styles.block}>
            <h3 className={styles.exceptionalService}>Exceptional Service</h3>
            <div className={styles.ourTeamIs}>
              Our commitment to excellence is evident in everything we do. From
              our prompt and professional communication to our seamless
              coordination on the day of the event, we strive to provide
              exceptional service at every step of the way.
            </div>
          </div>
        </div>
        <button className={styles.buttons} onClick={openContact}>
          <div className={styles.label}>Contact Now</div>
          <img className={styles.vectorIcon} alt="" />
        </button>
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

export default FrameComponent18;
