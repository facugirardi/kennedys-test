import type { NextPage } from "next";
import { useCallback } from "react";
import Vuesaxlinearhierarchy from "./vuesaxlinearhierarchy"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import IconChevron from "./icon-chevron"
import FrameComponent from "./frame-component"
import styles from "./details.module.css"

export type DetailsType = {
  className?: string;
};

const Details: NextPage<DetailsType> = ({ className = "" }) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/villas-list");
  }, [router]);

  return (
    <section className={[styles.details, className].join(" ")}>
      <div className={styles.availability}>
        <h1 className={styles.teresa}>Teresa</h1>
        <div className={styles.aLuxuryVillaContainer}>
          <p className={styles.aLuxuryVilla}>
            A luxury villa with homey feeling in Kranidi, Porto Heli, Greece  “A
            beautiful property
          </p>
          <p className={styles.locatedInOneOfThePrimmest}>
            <span
              className={styles.locatedInOne}
            >{`located in one of the primmest areas of Portoheli providing `}</span>
            <span className={styles.magical}>magical</span>
            <span className={styles.locatedInOne}> views, comfortable</span>
          </p>
          <p className={styles.aLuxuryVilla}>
            and spacious features to embrace your holidays with friends and
            family.”
          </p>
        </div>
        <div className={styles.actions}>
          <div className={styles.saveAction}>
            <img
              className={styles.vuesaxlinearheartIcon}
              loading="lazy"
              alt=""
              src="/vuesaxlinearheart1.svg"
            />
            <div className={styles.save}>Save</div>
          </div>
          <div className={styles.shareAction}>
            <Vuesaxlinearhierarchy vuesaxlinearhierarchy2="/vuesaxlinearhierarchy2.svg" />
            <div className={styles.share}>Share</div>
          </div>
        </div>
        <div className={styles.label}>Price upon request</div>
      </div>
      <form className={styles.booking}>
        <div className={styles.checkButton}>
          <h1 className={styles.checkAvailability}>Check Availability</h1>
          <div className={styles.buttons} onClick={onButtonsContainerClick}>
            <div className={styles.label1}> Filters</div>
            <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="/vuesaxlinearcandle2.svg" />
          </div>
        </div>
        <div className={styles.inputFields}>
          <div className={styles.inputTrioParent}>
            <div className={styles.inputTrio}>
              <div className={styles.label2}>
                <div className={styles.location}>Location</div>
              </div>
              <div className={styles.fieldText}>
                <img
                  className={styles.leadingIcon}
                  alt=""
                  src="/leading-icon1.svg"
                />
                <div className={styles.container}>
                  <div className={styles.mykonos}>Mykonos</div>
                  <div className={styles.chips}>
                    <div className={styles.chip}>
                      <img
                        className={styles.leadingIcon1}
                        alt=""
                        src="/leadingicon.svg"
                      />
                      <div className={styles.label3}>{`Chip `}</div>
                      <b className={styles.number}>213</b>
                      <input className={styles.trailingIcon} type="checkbox" />
                    </div>
                    <div className={styles.chip}>
                      <img
                        className={styles.leadingIcon1}
                        alt=""
                        src="/leadingicon.svg"
                      />
                      <div className={styles.label3}>Chip</div>
                      <b className={styles.number}>213</b>
                      <input className={styles.trailingIcon} type="checkbox" />
                    </div>
                    <div className={styles.div}>+2</div>
                  </div>
                </div>
                <IconChevron
                  iconChevron="/trailing-icon14.svg"
                  propWidth="27.2px"
                  propHeight="24px"
                />
                <img
                  className={styles.leadingIcon}
                  alt=""
                  src="/trailing-icon2.svg"
                />
              </div>
            </div>
            <div className={styles.inputTrio1}>
              <div className={styles.label2}>
                <div className={styles.location}>Villa</div>
              </div>
              <div className={styles.fieldText1}>
                <img
                  className={styles.leadingIcon}
                  alt=""
                  src="/leading-icon1.svg"
                />
                <input
                  className={styles.container1}
                  placeholder="Teresa"
                  type="text"
                />
                <img
                  className={styles.leadingIcon}
                  alt=""
                  src="/trailing-icon2.svg"
                />
              </div>
            </div>
            <div className={styles.inputTrio2}>
              <FrameComponent
                checkIn="Check In"
                trailingIcon2="/trailing-icon15.svg"
                trailingIcon3
                showTrailingIcon
                iconCalendar="/trailing-icon-11.svg"
                propWidth1="27.2px"
              />
              <FrameComponent
                propFlex="1"
                propWidth="unset"
                propAlignSelf="stretch"
                checkIn="Check In Out"
                trailingIcon2="/trailing-icon15.svg"
                trailingIcon3={false}
                showTrailingIcon
                iconCalendar="/trailing-icon-11.svg"
                propWidth1="27.2px"
              />
            </div>
          </div>
        </div>
        <button className={styles.buttons1}>
          <div className={styles.label6}>Check Now</div>
          <img className={styles.vectorIcon} alt="" src="/vector.svg" />
        </button>
      </form>
    </section>
  );
};

export default Details;
