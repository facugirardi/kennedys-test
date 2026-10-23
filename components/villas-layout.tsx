import type { NextPage } from "next";
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import styles from "./villas-layout.module.css"

export type VillasLayoutType = {
  className?: string;
  villasImages?: string;
  title?: string;
  capa1?: string;
  propHeight?: string;
  propWidth?: string;
};

const VillasLayout: NextPage<VillasLayoutType> = ({
  className = "",
  villasImages,
  title,
  capa1,
  propHeight,
  propWidth,
}) => {
  return (
    <div className={[styles.villasLayout, className].join(" ")}>
      <img className={styles.villasImagesIcon} alt="" src={villasImages} />
      <div className={styles.villasHearts}>
        <VuesaxlinearheartIcon1
          vuesaxlinearheart="/vuesaxlinearheart.svg"
          propHeight={propHeight}
          propWidth={propWidth}
        />
      </div>
      <div className={styles.villasInfo}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.title1}>Ibiza</div>
        <div className={styles.title2}>8 Bedrooms | 20 Guest | 2 Pools</div>
        <div className={styles.villaCapacity}>
          <div className={styles.villaCapacityLayout}>
            <img className={styles.capa1Icon} alt="" src={capa1} />
            <div className={styles.title3}>From € 12,000.00 / Night</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillasLayout;
