import type { NextPage } from "next";
import styles from "./property-details.module.css"

export type PropertyDetailsType = {
  className?: string;
  property?: any;
};

const PropertyDetails: NextPage<PropertyDetailsType> = ({ className = "", property = {} }) => {
  const { classification, amenity } = property

  return (
    <section className={[styles.propertyDetails, className].join(" ")}>
      <div className={styles.titleContainer}>
        <img
          className={styles.titleContainerChild}
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
            <p className={styles.exclusive}>Bedrooms: {classification?.bedrooms || 0}</p>
            <p className={styles.exclusive}>Service Bedrooms: {classification?.serviceBedrooms || 0}</p>
            <p className={styles.exclusive}>Baths: {classification?.baths || 0}</p>
            <p className={styles.exclusive}>Property Size: {classification?.indoorArea || 0} sqm</p>
            <p className={styles.exclusive}>Land Size: {classification?.outdoorArea || 0} sqm</p>
          </div>
        </div>
        <div className={styles.block1}>
          <h3 className={styles.facilities1}>Indoor Facilities</h3>
          <div className={styles.privateSwimmingPoolContainer}>
            {classification?.indoorFacilities?.map((e: string, index: number) => {
              return index <= 7 && <p className={styles.exclusive}>{e}</p>
            })}
            {classification?.indoorFacilities?.length > 7 && <p className={styles.exclusive}>{"...and more"}</p>}
          </div>
        </div>
        <div className={styles.block}>
          <h3 className={styles.facilities1}>Outdoor Facilities</h3>
          <div className={styles.fireplaceAlarmSystemContainer}>
            {classification?.outdoorFacilities?.map((e: string, index: number) => {
              return index <= 7 && <p className={styles.exclusive}>{e}</p>
            })}
            {classification?.outdoorFacilities?.length > 7 && <p className={styles.exclusive}>{"...and more"}</p>}
          </div>
        </div>
        {/* <div className={styles.block}>
          <h3 className={styles.accomodations}>Accomodations</h3>
          <div className={styles.bedroomDetails}>
            <div className={styles.xDoubleBedroomsContainer}>
              <p className={styles.exclusive}>3 x Double Bedrooms</p>
              <p className={styles.exclusive}>1 x Twin Bedroom</p>
              <p className={styles.exclusive}>1 x Guest Room</p>
            </div>
          </div>
        </div> */}
        <div className={styles.block}>
          <h3 className={styles.enjoy}>Enjoy</h3>
          <div className={styles.barbecueNearTheContainer}>
            {amenity?.amenities?.map((e: string, index: number) => {
              return index <= 7 && <p className={styles.exclusive}>{e}</p>
            })}
            {amenity?.amenities?.length > 7 && <p className={styles.exclusive}>{"...and more"}</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyDetails;
