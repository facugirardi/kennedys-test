import type { NextPage } from "next";
import styles from "./details-popup.module.css"

export type DetailsPopupType = {
  className?: string;
};

const DetailsPopup: NextPage<DetailsPopupType> = ({ className = "" }) => {
  return (
    <section className={[styles.detailsPopup, className].join(" ")}>
      <div className={styles.popupHeader}>
        <img
          className={styles.headerBackgroundIcon}
          loading="lazy"
          alt=""
          src="/rectangle-831@2x.png"
        />
        <div className={styles.title}>
          <h1 className={styles.text}>
            <p className={styles.exclusive}>Exclusive</p>
            <p className={styles.exclusive}>facilities</p>
          </h1>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.block}>
          <h3 className={styles.general}>General</h3>
          <div className={styles.bedrooms5Sleeps10BathsContainer}>
            <p className={styles.exclusive}>Bedrooms: 5</p>
            <p className={styles.exclusive}>Sleeps: 10</p>
            <p className={styles.exclusive}>Baths: 5</p>
            <p className={styles.exclusive}>Property Size: 270 sqm</p>
            <p className={styles.exclusive}>Land Size: 4500 sqm</p>
          </div>
        </div>
        <div className={styles.block1}>
          <h3 className={styles.facilities1}>Facilities</h3>
          <div className={styles.privateSwimmingPoolContainer}>
            <p className={styles.exclusive}>Private Swimming Pool</p>
            <p className={styles.exclusive}>Multiple outdoor lounging</p>
            <p className={styles.exclusive}>areas</p>
            <p className={styles.exclusive}>Outdoor BBQ</p>
            <p className={styles.exclusive}>Pool Bar</p>
            <p className={styles.exclusive}>Laundry Room</p>
            <p className={styles.exclusive}>Flat-screen TV</p>
          </div>
        </div>
        <div className={styles.block}>
          <h3 className={styles.facilities1}>Facilities</h3>
          <div className={styles.fireplaceAlarmSystemContainer}>
            <p className={styles.exclusive}>Fireplace</p>
            <p className={styles.exclusive}>Alarm System</p>
            <p className={styles.exclusive}>Safe Boxes</p>
            <p className={styles.exclusive}>Fully equipped kitchen</p>
            <p className={styles.exclusive}>Air conditioning</p>
            <p className={styles.exclusive}>WI-FI internet access</p>
            <p className={styles.exclusive}>Private parking area</p>
          </div>
        </div>
        <div className={styles.block}>
          <h3 className={styles.accomodations}>Accomodations</h3>
          <div className={styles.accomodationDescription}>
            <div className={styles.xDoubleBedroomsContainer}>
              <p className={styles.exclusive}>3 x Double Bedrooms</p>
              <p className={styles.exclusive}>1 x Twin Bedroom</p>
              <p className={styles.exclusive}>1 x Guest Room</p>
            </div>
          </div>
        </div>
        <div className={styles.block}>
          <h3 className={styles.enjoy}>Enjoy</h3>
          <div className={styles.barbecueNearTheContainer}>
            <p className={styles.exclusive}>Barbecue near the sea</p>
            <p className={styles.exclusive}>Private Pool</p>
            <p className={styles.exclusive}>Sea View</p>
            <p className={styles.exclusive}>Sunset View</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailsPopup;
