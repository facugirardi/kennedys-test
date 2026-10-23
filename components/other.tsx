import type { NextPage } from "next";
import CarInfo from "./car-info"
import styles from "./other.module.css"

export type OtherType = {
  className?: string;
};

const Other: NextPage<OtherType> = ({ className = "" }) => {
  return (
    <section className={[styles.other, className].join(" ")}>
      <h1 className={styles.otherChaufferOptions}>
        Other Chauffer Options in Mykonos
      </h1>
      <div className={styles.slider}>
        <div className={styles.groupParent}>
          <div className={styles.frameParent}>
            <div className={styles.vectorWrapper}>
              <img className={styles.vectorIcon} loading="lazy" alt="" />
            </div>
            <div className={styles.circle} />
          </div>
          <img className={styles.groupChild} loading="lazy" alt="" />
        </div>
        <div className={styles.carOptions}>
          <div className={styles.cardImageParent}>
            <img className={styles.cardImageIcon} alt="" />
            <img className={styles.groupItem} alt="" />
            <div className={styles.vuesaxlinearheartWrapper}>
              <img
                className={styles.vuesaxlinearheartIcon}
                loading="lazy"
                alt=""
              />
            </div>
            <div className={styles.audiA3}>Audi A3</div>
            <div className={styles.moreInfo}>More info</div>
          </div>
          <CarInfo
            group167="pending_286:4351"
            rectangle81="pending_286:4354"
            vuesaxlinearheart="pending_972:7432"
            wranglerJeep="Wrangler Jeep"
          />
          <CarInfo
            group167="pending_286:4358"
            propLeft="calc(50% - 132.45px)"
            rectangle81="pending_286:4361"
            vuesaxlinearheart="pending_972:7439"
            wranglerJeep="Mercedes Sprinter"
          />
          <CarInfo
            group167="pending_286:4365"
            propLeft="calc(50% - 132.9px)"
            rectangle81="pending_286:4368"
            vuesaxlinearheart="pending_972:7446"
            wranglerJeep="Mercedes"
          />
        </div>
      </div>
    </section>
  );
};

export default Other;
