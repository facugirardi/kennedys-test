import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import ItineraryLabels from "./itinerary-labels"
import styles from "./additional-services.module.css"

export type AdditionalServicesType = {
  className?: string;
};

const AdditionalServices: NextPage<AdditionalServicesType> = ({
  className = "",
}) => {
  const router = useRouter();

  const onViewAllServicesClick = useCallback(() => {
    router.push("/concierge");
  }, [router]);

  return (
    <section className={[styles.additionalServices, className].join(" ")}>
      <div className={styles.customizeYourExperience}>
        Customize your experience with additional services such as private
        chefs, spa treatments, and transportation, all tailored to your
        preferences.
      </div>
      <h1 className={styles.globalConciergeServices}>
        Global Concierge Services
      </h1>
      <div className={styles.concierge}>
        <div className={styles.groupParent}>
          <div className={styles.frameParent}>
            <div className={styles.circleShapeWrapper}>
              <img
                className={styles.circleShapeIcon}
                alt=""
                src="/vector-2.svg"
              />
            </div>
            <div className={styles.circleBackground} />
          </div>
          <img
            className={styles.groupChild}
            loading="lazy"
            alt=""
            src="/group-86-1@2x.png"
          />
        </div>
        <ItineraryLabels
          group50="/group-50@2x.png"
          group54="/group-54@2x.png"
          group49="/group-49@2x.png"
          group55="/group-55@2x.png"
        />
        <div
          className={styles.viewAllServices}
          onClick={onViewAllServicesClick}
        >
          View all services
        </div>
      </div>
    </section>
  );
};

export default AdditionalServices;
