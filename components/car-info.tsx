import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./car-info.module.css"

export type CarInfoType = {
  className?: string;
  group167?: string;
  rectangle81?: string;
  vuesaxlinearheart?: string;
  wranglerJeep?: string;

  /** Style props */
  propLeft?: CSSProperties["left"];
};

const CarInfo: NextPage<CarInfoType> = ({
  className = "",
  group167,
  propLeft,
  rectangle81,
  vuesaxlinearheart,
  wranglerJeep,
}) => {
  const groupIconStyle: CSSProperties = useMemo(() => {
    return {
      left: propLeft,
    };
  }, [propLeft]);

  return (
    <div className={[styles.carInfo, className].join(" ")}>
      <div className={styles.moreInfo}>More info</div>
      <img
        className={styles.carInfoChild}
        alt=""
        src={group167}
        style={groupIconStyle}
      />
      <div className={styles.carDetails}>
        <img className={styles.carDetailsChild} alt="" src={rectangle81} />
        <div className={styles.vuesaxlinearheartWrapper}>
          <img
            className={styles.vuesaxlinearheartIcon}
            loading="lazy"
            alt=""
            src={vuesaxlinearheart}
          />
        </div>
        <div className={styles.wranglerJeep}>{wranglerJeep}</div>
      </div>
    </div>
  );
};

export default CarInfo;
