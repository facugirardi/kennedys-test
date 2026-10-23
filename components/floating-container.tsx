import type { NextPage } from "next";
import styles from "./floating-container.module.css"

export type FloatingContainerType = {
  className?: string;
};

const FloatingContainer: NextPage<FloatingContainerType> = ({
  className = "",
}) => {
  return (
    <section className={[styles.floatingContainer, className].join(" ")}>
      <img className={styles.innerFloatingContainer} loading="lazy" alt="" />
      <div className={styles.imageContainer}>
        <div className={styles.imageLayout}>
          <img className={styles.imageIcon} loading="lazy" alt="" />
        </div>
        <div className={styles.imageLayout1}>
          <img className={styles.imageIcon} loading="lazy" alt="" />
        </div>
        <div className={styles.singleImageContainer}>
          <img className={styles.imageIcon} loading="lazy" alt="" />
        </div>
        <div className={styles.imageLayout}>
          <div className={styles.imageInnerContentWrapper}>
            <img className={styles.imageIcon} loading="lazy" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FloatingContainer;
