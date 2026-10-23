import type { NextPage } from "next";
import styles from "./group-component3.module.css"

export type GroupComponent3Type = {
  className?: string;
};

const GroupComponent3: NextPage<GroupComponent3Type> = ({ className = "" }) => {
  return (
    <div className={[styles.groupParent, className].join(" ")}>
      <div className={styles.valuesListParent}>
        <div className={styles.valuesList}>
          <div className={styles.luxuryExperience}>Luxury Experience</div>
          <div className={styles.providingCuratedAccommodatio}>
            Providing curated accommodations and personalized services for an
            unforgettable stay.
          </div>
        </div>
        <div className={styles.valuesList1}>
          <div className={styles.exceptionalHospitality}>
            Exceptional Hospitality
          </div>
          <div className={styles.providingCuratedAccommodatio}>
            Ensuring attentive service, attention to detail, and a welcoming
            atmosphere.
          </div>
        </div>
        <div className={styles.valuesList2}>
          <div className={styles.authenticityAndIntegrityContainer}>
            <p className={styles.authenticity}>Authenticity</p>
            <p className={styles.authenticity}>and Integrity:</p>
          </div>
          <div className={styles.providingCuratedAccommodatio}>
            Upholding transparency, honesty, and reliability in all interactions
            and operations.
          </div>
        </div>
        <div className={styles.valuesList3}>
          <div className={styles.exclusivityAndPrivacyContainer}>
            <p className={styles.authenticity}>Exclusivity</p>
            <p className={styles.authenticity}>and Privacy</p>
          </div>
          <div className={styles.providingCuratedAccommodatio}>
            Offering secluded villas, discreet service, and tailored experiences
            for a private getaway.
          </div>
        </div>
      </div>
      <img className={styles.valuesListIcon} alt="" src="/values-list.svg" />
      <img className={styles.valuesListIcon1} alt="" src="/values-list1.svg" />
      <img className={styles.valuesListIcon2} alt="" src="/values-list.svg" />
    </div>
  );
};

export default GroupComponent3;
