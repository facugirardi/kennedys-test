import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./card3.module.css"

export type Card3Type = {
  className?: string;
  imageCard?: string;
  title?: string;
  capa1?: string;

  /** Style props */
  propLeft?: CSSProperties["left"];
};

const Card3: NextPage<Card3Type> = ({
  className = "",
  imageCard,
  title,
  capa1,
  propLeft,
}) => {
  const capa1IconStyle: CSSProperties = useMemo(() => {
    return {
      left: propLeft,
    };
  }, [propLeft]);

  return (
    <div className={[styles.card, className].join(" ")}>
      <img className={styles.imageCardIcon} alt="" src={imageCard} />
      <div className={styles.titleParent}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.title1}>Ibiza</div>
        <div className={styles.title2}>8 Bedrooms | 20 Guest | 2 Pools</div>
        <div className={styles.frameWrapper}>
          <div className={styles.capa1Parent}>
            <img
              className={styles.capa1Icon}
              loading="lazy"
              alt=""
              src={capa1}
              style={capa1IconStyle}
            />
            <div className={styles.title3}>From € 12,000.00 / Night</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card3;
