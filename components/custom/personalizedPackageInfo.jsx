
import styles from "./personalizedPackageInfo.module.css"@/components/custom/from "./personalizedPackageInfo.module.css;



// Example usage component
const PersonalizedPackageInfo = ({ property, className }) => {

    const starRating = property ? parseInt(property?.classification?.classification?.split("_") || "4") : 7
    return (
        <section className={[styles.package, className].join(" ")}>
            <div className={styles.packagesContainer}>
                <div className={styles.packageDetails}>
                    <div className={styles.row}>
                        {starRating >= 5 && <div className={styles.block}>
                            <h3 className={styles.stars}>5 Stars</h3>
                            <div className={styles.indulgeInA}>
                                Indulge in a stress-free getaway with personalized itinerary
                                planning, VIP access, and seamless coordination of your
                                travel needs.
                            </div>
                        </div>}
                        {starRating >= 6 && <div className={styles.block}>
                            <h3 className={styles.stars1}>6 stars</h3>
                            <div className={styles.indulgeInA}>
                                Elevate your experience with enhanced services, including
                                24/7 dedicated concierge support, expedited access, and
                                prime seating at top venues and events.
                            </div>
                        </div>}
                        {starRating === 7 && <div className={styles.block}>
                            <h3 className={styles.stars2}>7 stars</h3>
                            <div className={styles.indulgeInA}>
                                Reach for the sky with our most exclusive package, offering
                                unlimited changes to your itinerary, personalized assistance
                                throughout your stay, and access to the most coveted
                                experiences and venues worldwide.
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
            <div className={styles.packageFeatures}>
                <div className={styles.featureList}>
                    <div className={styles.featureList}>
                        <div className={styles.featureItemChild} />
                        <div className={styles.featureDescription}>
                            <h1 className={styles.villaTheresaOffer}>
                                Personalized itineraries and bookings {property?.title && `in ${property?.title}`}
                            </h1>
                            <div className={styles.experienceLuxuryAtContainer}>
                                <p className={styles.experienceLuxuryAt}>
                                    Experience luxury at its finest with our range of
                                    Concierge Packages tailored to meet your every need.
                                    Choose from our
                                </p>
                                <p className={styles.villaTheresaIs}>
                                    <span className={styles.star6StarAnd}>
                                        {starRating >= 7 && ("5-star, 6-star, and 7-star packages")}
                                        {starRating === 6 && ("5-star, 6-star")}
                                        {starRating === 5 && ("5-star")}
                                    </span>
                                    <span className={styles.eachOfferingA}>
                                        {" "}
                                        {starRating > 4 && "each offering a"} unique blend of services to ensure an
                                        unforgettable experience.
                                    </span>
                                </p>
                            </div>
                        </div>
                        <img
                            className={styles.featureItemItem}
                            alt=""
                            src="/rectangle-52@2x.png"
                        />
                        <img
                            className={styles.featureItemInner}
                            loading="lazy"
                            alt=""
                            src="/rectangle-65@2x.png"
                        />
                        <img
                            className={styles.rectangleIcon}
                            alt=""
                            src="/rectangle-661@2x.png"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PersonalizedPackageInfo;