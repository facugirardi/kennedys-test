import type { NextPage } from "next";
import styles from "./partners.module.css"

export type PartnersType = {
  className?: string;
  image10?: string;
  image11?: string;
  image12?: string;
  image13?: string;
  image14?: string;
  image15?: string;
  image16?: string;
};

const Partners: NextPage<PartnersType> = ({
  className = "",
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
}) => {
  return (
    <div className={[styles.partners, className].join(" ")}>
      <div className={styles.partnersContent}>
        <div className={styles.partners1}>Partners</div>
        <img
          className={styles.image10Icon}
          loading="lazy"
          alt=""
          src={image10}
        />
        <img
          className={styles.image11Icon}
          loading="lazy"
          alt=""
          src={image11}
        />
        <img
          className={styles.image12Icon}
          loading="lazy"
          alt=""
          src={image12}
        />
        <img
          className={styles.image13Icon}
          loading="lazy"
          alt=""
          src={image13}
        />
        <img
          className={styles.image14Icon}
          loading="lazy"
          alt=""
          src={image14}
        />
        <img className={styles.image15Icon} alt="" src={image15} />
        <img
          className={styles.image16Icon}
          loading="lazy"
          alt=""
          src={image16}
        />
      </div>
    </div>
  );
};

export default Partners;
