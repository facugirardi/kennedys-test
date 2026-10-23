import type { NextPage } from "next";
import styles from "./location-details.module.css"

export type LocationDetailsType = {
  className?: string;
};

const LocationDetails: NextPage<LocationDetailsType> = ({ className = "" }) => {
  return (
    <div className={[styles.locationDetails, className].join(" ")}>
      <div className={styles.location}>Location</div>
      <div className={styles.distances}>Distances</div>
      <div className={styles.locationElements} />
      <div className={styles.locationElements1} />
      <div className={styles.calle32SurContainer}>
        <p className={styles.calle32Sur}>Calle 32 Sur, Mza 552, Lote 2</p>
        <p className={styles.calle32Sur}>7765 Tulum, Quintana Roo</p>
        <p className={styles.calle32Sur}>México</p>
      </div>
    </div>
  );
};

export default LocationDetails;
