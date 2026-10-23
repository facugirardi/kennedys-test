import type { NextPage } from "next";
import styles from "./content-row-two.module.css"

export type ContentRowTwoType = {
  className?: string;
};

const ContentRowTwo: NextPage<ContentRowTwoType> = ({ className = "" }) => {
  return (
    <div className={[styles.contentRowTwo, className].join(" ")}>
      <div className={styles.contentRowThree}>
        <div className={styles.contentRowFour}>
          <div className={styles.contentRowFive}>
            <div className={styles.contentRowSix}>
              <div className={styles.companyInfo}>
                <h1 className={styles.kennedysLuxuryVilla}>
                  Kennedy's Luxury Villa Management
                </h1>
              </div>
              <div className={styles.helpYourPropertyContainer}>
                <p className={styles.helpYourProperty}>
                  Help your property take off and maximise your investment by
                  trusting the management in our capable and caring professional
                  hands.  
                </p>
                <p className={styles.helpYourProperty}> </p>
              </div>
            </div>
          </div>
          <div className={styles.approach}>
            <div className={styles.pricelessExperienceWeContainer}>
              <p className={styles.pricelessExperience}>
                Priceless Experience​ 
              </p>
              <p className={styles.weHaveBeen}>
                We have been thriving in the demanding villa management business
                for over a decade now, fully handling and managing luxurious
                villa rentals on Mykonos, the Cyclades and Latin America. 
              </p>
            </div>
          </div>
        </div>
        <div className={styles.cardParent}>
          <div className={styles.card}>
            <img
              className={styles.image1Icon}
              loading="lazy"
              alt=""
              src="/image-110@2x.png"
            />
            <div className={styles.text}>
              <div className={styles.handsOnApproach}>Hands-on Approach </div>
              <div className={styles.weArePresent}>
                We are present every step of the way. Our experience and elite
                clientele have taught us the importance of leaving nothing to
                chance and personally taking care of every detail.  
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <img
              className={styles.image1Icon}
              loading="lazy"
              alt=""
              src="/image-24@2x.png"
            />
            <div className={styles.text}>
              <div className={styles.handsOnApproach}>
                High-end Guest Portfolio​
              </div>
              <div className={styles.weArePresent}>
                We acquire access and tend to the needs of a top-luxury direct
                client portfolio, which provides us with deep knowledge of
                high-level guests’ wants and demands. 
              </div>
            </div>
          </div>
          <div className={styles.card2}>
            <img
              className={styles.image1Icon}
              loading="lazy"
              alt=""
              src="/image-1-1@2x.png"
            />
            <div className={styles.text}>
              <div className={styles.handsOnApproach}>Worldwide Presence​ </div>
              <div className={styles.weHaveA}>
                We have a distinguished presence in top-notch holiday
                destinations around the globe; we fly from Mykonos to Tulum,
                from Europe to Latin America, from one paradise to another.​ 
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <img
              className={styles.image1Icon}
              loading="lazy"
              alt=""
              src="/image-2-1@2x.png"
            />
            <div className={styles.text}>
              <div className={styles.handsOnApproach}>
                Deep Market Knowledge
              </div>
              <div className={styles.weHaveA}>
                We've inspected over 2,000 luxury properties, enhancing our
                services to transform residential spaces into high-end
                commercial properties, maximizing income potential.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentRowTwo;
