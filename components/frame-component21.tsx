import type { NextPage } from "next";
import styles from "./frame-component21.module.css"
export type FrameComponent21Type = {
  className?: string;
};

const FrameComponent21: NextPage<FrameComponent21Type> = ({
  className = "",
}) => {
  return (
    <section className={[styles.journeyTitleParent, className].join(" ")}>
      <div className={styles.journeyTitle}>
        <img className={styles.journeyTitleChild} alt="" />
        <div className={styles.elevatingTheJourney}>ELEVATING THE JOURNEY</div>
        <div className={styles.fromElectricallyOperatedDoo}>
          From electrically-operated doors* to massage seats with "hot stone"
          functionality, every aspect of the Range Rover ensures a first-class
          travel experience.
        </div>
      </div>
      <div className={styles.journeyTitle1}>
        <img className={styles.journeyTitleItem} loading="lazy" alt="" />
        <div className={styles.executiveComfort}>EXECUTIVE COMFORT</div>
        <div className={styles.theExecutiveClass}>
          The Executive Class rear seats provide the comfort of four seats with
          the versatility of five. Additionally, there's the rear seat
          touchscreen controller and the optional Comfort Plus Pack.
        </div>
      </div>
      <div className={styles.groupParent}>
        <img className={styles.frameChild} loading="lazy" alt="" />
        <div className={styles.spaceForEveryoneParent}>
          <div className={styles.spaceForEveryone}>SPACE FOR EVERYONE</div>
          <div className={styles.theExecutiveClass}>
            The long-wheelbase seven-seater offers an unparalleled travel
            experience for up to seven adults, featuring heated Semi-Aniline
            leather seats, USB-C ports, and reading lights.
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent21;
