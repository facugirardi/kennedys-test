import type { NextPage } from "next";
import styles from "./villa-items.module.css"

export type VillaItemsType = {
  className?: string;
  villaImages?: string;
  capa1?: string;
};

const VillaItems: NextPage<VillaItemsType> = ({
  className = "",
  villaImages,
  capa1,
}) => {
  return (
    <div className={[styles.villaItems, className].join(" ")}>
      <img className={styles.villaImagesIcon} alt="" src={villaImages} />
      <div className={styles.villaContent}>
        <h1 className={styles.title}>Villas Name</h1>
        <div className={styles.title1}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum hasen the industry standard dummy text ever
          since
        </div>
        <div className={styles.title2}>8 Bedrooms | 20 Guest | 2 Pools</div>
        <div className={styles.villaLinks}>
          <img className={styles.capa1Icon} alt="" src={capa1} />
          <div className={styles.title3}>From € 12,000.00 / Night</div>
        </div>
      </div>
    </div>
  );
};

export default VillaItems;
