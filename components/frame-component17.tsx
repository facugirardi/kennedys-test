import type { NextPage } from "next";
import styles from "./frame-component17.module.css"

export type FrameComponent17Type = {
  className?: string;
};

const FrameComponent17: NextPage<FrameComponent17Type> = ({
  className = "",
}) => {
  return (
    <section className={[styles.servicesTitleParent, className].join(" ")}>
      <div className={styles.servicesTitle}>
        <h1 className={styles.servicesOffered}>Services Offered</h1>
      </div>
      <div className={styles.servicesGrid}>
        <div className={styles.groupParent}>
          <img className={styles.frameChild} alt="" />
          <div className={styles.customizedThemes}>Customized Themes</div>
          <div className={styles.groupWrapper}>
            <div className={styles.capa1Wrapper}>
              <div className={styles.capa1} />
            </div>
          </div>
        </div>
        <div className={styles.groupContainer}>
          <img className={styles.frameItem} alt="" />
          <div className={styles.comprehensivePlanning}>
            Comprehensive Planning
          </div>
          <div className={styles.groupWrapper}>
            <div className={styles.capa1Wrapper}>
              <div className={styles.capa1} />
            </div>
          </div>
        </div>
        <div className={styles.tailoredExperienceContainer}>
          <img className={styles.tailoredExperienceContainerChild} alt="" />
          <div className={styles.tailoredExperiencesWrapper}>
            <div className={styles.tailoredExperiences}>
              Tailored Experiences
            </div>
          </div>
        </div>
        <div className={styles.coordinationContainer}>
          <img
            className={styles.coordinationContainerChild}
            loading="lazy"
            alt=""
          />
          <div className={styles.seamlessCoordination}>
            Seamless Coordination
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent17;
