import type { NextPage } from "next";
import LocationDetails from "./location-details"
import styles from "./location-distances.module.css"

export type LocationDistancesType = {
  className?: string;
};

const LocationDistances: NextPage<LocationDistancesType> = ({
  className = "",
}) => {
  return (
    <section className={[styles.locationDistances, className].join(" ")}>
      <img className={styles.image6Icon} alt="" src="/image-63@2x.png" />
      <textarea className={styles.distanceDivider} rows={9} cols={20} />
      <h1 className={styles.locationAndDistances}>Location and Distances</h1>
      <LocationDetails />
    </section>
  );
};

export default LocationDistances;
