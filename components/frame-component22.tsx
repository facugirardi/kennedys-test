import type { NextPage } from "next";
import { useState, useCallback } from "react";
import Contact from "./contact"
import PortalPopup from "./portal-popup"
import styles from "./frame-component22.module.css"

export type FrameComponent22Type = {
  className?: string;
};

const FrameComponent22: NextPage<FrameComponent22Type> = ({
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
      <section className={[styles.featuresContentWrapper, className].join(" ")}>
        <div className={styles.featuresContent}>
          <h1 className={styles.keyFeatures}>Key Features</h1>
          <div className={styles.featuresList}>
            <div className={styles.lI6EngineContainer}>
              <ul className={styles.lI6Engine8SpdWodTransm}>
                <li className={styles.lI6Engine}>3.0L I-6 Engine</li>
                <li className={styles.lI6Engine}>8-spd w/OD Transmission</li>
                <li className={styles.lI6Engine}>355 @ 5,500 rpm Horsepower</li>
                <li className={styles.lI6Engine}>365 @ 2,000 rpm Torque</li>
                <li className={styles.lI6Engine}>
                  Terrain Response four-wheel Drive type
                </li>
                <li className={styles.lI6Engine}>
                  ABS and driveline Traction control
                </li>
                <li>19″ silver aluminum Wheels</li>
              </ul>
            </div>
            <div className={styles.lI6EngineContainer}>
              <ul className={styles.lI6Engine8SpdWodTransm}>
                <li className={styles.lI6Engine}>
                  Front air conditioning, dual zone automatic
                </li>
                <li className={styles.lI6Engine}>
                  SiriusXM AM/FM/HD/Satellite, seek-scan Radio
                </li>
                <li className={styles.lI6Engine}>3 – 1st row LCD monitor</li>
                <li className={styles.lI6Engine}>
                  Keyfob (all doors) Remote keyless entry
                </li>
                <li className={styles.lI6Engine}>Rear Fog/driving lights</li>
                <li className={styles.lI6Engine}>Heated mirrors</li>
                <li className={styles.lI6Engine}>
                  Windshield wipers – rain sensing
                </li>
                <li>Leather Seat trim.</li>
              </ul>
            </div>
            <div className={styles.driverAndPassengerLumbarSuParent}>
              <div className={styles.driverAndPassengerContainer}>
                <ul className={styles.lI6Engine8SpdWodTransm}>
                  <li className={styles.lI6Engine}>
                    Driver and passenger Lumbar support
                  </li>
                  <li className={styles.lI6Engine}>
                    InControl Navigation Pro with voice activation Navigation
                    system
                  </li>
                  <li>Front and Rear Parking Aid Parking assist</li>
                </ul>
              </div>
              <button className={styles.buttons} onClick={openContact}>
                <div className={styles.label}>Book Now</div>
                <img className={styles.vectorIcon} alt="" />
              </button>
            </div>
          </div>
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

export default FrameComponent22;
