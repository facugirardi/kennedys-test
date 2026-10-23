import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import VuesaxlinearstarIcon from "./vuesaxlinearstar-icon"
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import styles from "./card4.module.css"

export type Card4Type = {
  className?: string;
};

const Card4: NextPage<Card4Type> = ({ className = "" }) => {
  const router = useRouter();

  const onCardContainerClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <div
      className={[styles.card, className].join(" ")}
      onClick={onCardContainerClick}
    >
      <img className={styles.cardContentIcon} alt="" src="/card-image@2x.png" />
      {/* World's top 12 badge - commented out, can be re-enabled if needed */}
      {/* <button className={styles.vuesaxlinearstarParent}>
        <VuesaxlinearstarIcon />
        <div className={styles.worldsTop12}>World's top 12</div>
      </button> */}
      <div className={styles.vuesaxlinearheartWrapper}>
        <VuesaxlinearheartIcon1
          vuesaxlinearheart="/vuesaxlinearheart.svg"
          propHeight="18px"
          propWidth="18px"
        />
      </div>
      <div className={styles.cardFooter}>
        <h2 className={styles.title}>Mia</h2>
        <div className={styles.title1}>Ibiza</div>
        <div className={styles.title2}>8 Bedrooms | 20 Guest | 2 Pools</div>
        <div className={styles.cardFooterImage}>
          <div className={styles.capa1Parent}>
            <img
              className={styles.capa1Icon}
              loading="lazy"
              alt=""
              src="/capa-1-4@2x.png"
            />
            <div className={styles.title3}>From € 12,000.00 / Night</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card4;
