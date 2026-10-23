import type { NextPage } from "next";
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import styles from "./property-card-one.module.css"

export type PropertyCardOneType = {
  className?: string;
  image?: string;
  vuesaxlinearheart?: string;
  propHeight?: string;
  propWidth?: string;
};

const PropertyCardOne: NextPage<PropertyCardOneType> = ({
  className = "",
  image,
  vuesaxlinearheart,
  propHeight,
  propWidth,
}) => {
  return (
    <div className={[styles.propertyCardOne, className].join(" ")}>
      <img className={styles.imageIcon} alt="" src={image} />
      <div className={styles.vuesaxlinearheartWrapper}>
        <VuesaxlinearheartIcon1
          vuesaxlinearheart={vuesaxlinearheart}
          propHeight={propHeight}
          propWidth={propWidth}
        />
      </div>
      <div className={styles.topWrapper}>
        <div className={styles.top}>
          <div className={styles.mykonos}>
            <p className={styles.p}>$ 23.000.000</p>
            <p className={styles.p}>Mykonos</p>
          </div>
        </div>
      </div>
      <div className={styles.bedroomsParent}>
        <div className={styles.bedrooms}>8 Bedrooms</div>
        <div className={styles.bathrooms}>8 Bathrooms</div>
        <div className={styles.bathrooms}>1000 sq.m</div>
      </div>
    </div>
  );
};

export default PropertyCardOne;
