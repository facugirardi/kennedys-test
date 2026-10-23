import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import VuesaxlinearstarIcon from "./vuesaxlinearstar-icon"
import styles from "./card2.module.css"

export type Card2Type = {
  className?: string;
  rectangle39?: string;
  title?: string;
  capa1?: string;
  propHeight?: string;
  propWidth?: string;
};

const Card2: NextPage<Card2Type> = ({
  className = "",
  rectangle39,
  title,
  capa1,
  propHeight,
  propWidth,
}) => {
  const router = useRouter();

  const onCardContainerClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <div
      className={[styles.card, className].join(" ")}
      onClick={onCardContainerClick}
    >
      <img className={styles.cardChild} alt="" src={rectangle39} />
      <div className={styles.vuesaxlinearheartWrapper}>
        <VuesaxlinearheartIcon1
          vuesaxlinearheart="/vuesaxlinearheart.svg"
          propHeight={propHeight}
          propWidth={propWidth}
        />
      </div>
      <div className={styles.titleParent}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.title1}>Ibiza</div>
        <div className={styles.title2}>8 Bedrooms | 20 Guest | 2 Pools</div>
        <div className={styles.cardImageGridWrapper}>
          <div className={styles.cardImageGrid}>
            <img
              className={styles.capa1Icon}
              loading="lazy"
              alt=""
              src={capa1}
            />
            <div className={styles.title3}>From € 12,000.00 / Night</div>
          </div>
        </div>
      </div>
      {/* World's top 12 badge - commented out, can be re-enabled if needed */}
      {/* <button className={styles.vuesaxlinearstarParent}>
        <VuesaxlinearstarIcon />
        <div className={styles.worldsTop12}>World's top 12</div>
      </button> */}
    </div>
  );
};

export default Card2;
