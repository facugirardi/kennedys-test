import type { NextPage } from "next";
import styles from "./services-wrapper.module.css"

export type ServicesWrapperType = {
  className?: string;
  rectangle52?: string;
  rectangle65?: string;
  rectangle66?: string;
};

const ServicesWrapper: NextPage<ServicesWrapperType> = ({
  className = "",
  rectangle52,
  rectangle65,
  rectangle66,
}) => {
  return (
    <div className={[styles.servicesWrapper, className].join(" ")}>
      <div className={styles.servicesWrapperChild} />
      <div className={styles.personalizedItineraries}>
        <h1 className={styles.personalizedItinerariesAnd}>
          Personalized itineraries and bookings
        </h1>
        <div className={styles.experienceLuxuryAtContainer}>
          <p className={styles.experienceLuxuryAt}>
            Experience luxury at its finest with our range of Concierge Packages
            tailored to meet your every need. Choose from our
          </p>
          <p className={styles.star6StarAnd7StarPacka}>
            <span className={styles.star6StarAnd}>
              5-star, 6-star, and 7-star packages,
            </span>
            <span className={styles.eachOfferingA}>
              {" "}
              each offering a unique blend of services to ensure an
              unforgettable experience.
            </span>
          </p>
        </div>
      </div>
      <img className={styles.servicesWrapperItem} alt="" src={rectangle52} />
      <img
        className={styles.servicesWrapperInner}
        loading="lazy"
        alt=""
        src={rectangle65}
      />
      <img className={styles.rectangleIcon} alt="" src={rectangle66} />
    </div>
  );
};

export default ServicesWrapper;
