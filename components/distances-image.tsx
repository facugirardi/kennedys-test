import type { NextPage } from "next";
import LocationDetails from "./location-details"
import styles from "./distances-image.module.css"
export type DistancesImageType = {
  className?: string;
};

const DistancesImage: NextPage<DistancesImageType> = ({ className = "" }) => {
  return (
    <section className={[styles.distancesImage, className].join(" ")}>
      <img className={styles.image6Icon} alt="" src="/image-63@2x.png" />
      {/* <textarea className={styles.locationBlock} rows={9} cols={20} /> */}
      <h1 className={styles.locationAndDistances}>Location and Distances</h1>
      {/* <LocationDetails /> */}
    </section>
  );
};

export default DistancesImage;
