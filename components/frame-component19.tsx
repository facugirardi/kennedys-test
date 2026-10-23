import type { NextPage } from "next";
import styles from "./frame-component19.module.css"

export type FrameComponent19Type = {
  className?: string;
};

const FrameComponent19: NextPage<FrameComponent19Type> = ({
  className = "",
}) => {
  return (
    <section className={[styles.arrowParent, className].join(" ")}>
      <img className={styles.arrowIcon} loading="lazy" alt="" />
      <div className={styles.eventItems}>
        <h1 className={styles.annePaul}>{`Anne & Paul`}</h1>
      </div>
      <div className={styles.eventItems}>
        <h1 className={styles.markBirthday}>Mark Birthday</h1>
      </div>
      <div className={styles.eventItems2}>
        <h1 className={styles.company}>Company</h1>
      </div>
      <div className={styles.eventImageParent}>
        <div className={styles.eventImage}>
          <img className={styles.vectorIcon} alt="" />
        </div>
        <div className={styles.groupChild} />
      </div>
    </section>
  );
};

export default FrameComponent19;
