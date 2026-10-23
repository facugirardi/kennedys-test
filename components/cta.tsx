import type { NextPage } from "next";
import styles from "./cta.module.css"

export type CtaType = {
  className?: string;
};

const Cta: NextPage<CtaType> = ({ className = "" }) => {
  return (
    <div className={[styles.cta, className].join(" ")}>
      <div className={styles.buttons}>
        <div className={styles.label}>
          <p className={styles.check}>Check</p>
          <p className={styles.check}>Availability</p>
        </div>
        <img className={styles.vectorIcon} alt="" src="/vector-5.svg" />
      </div>
    </div>
  );
};

export default Cta;
