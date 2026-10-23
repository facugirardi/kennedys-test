import type { NextPage } from "next";
import VuesaxlinearcameraIcon from "./vuesaxlinearcamera-icon"
import Vuesaxlinearnote2Icon from "./vuesaxlinearnote2-icon"
import VuesaxlinearstarIcon1 from "./vuesaxlinearstar-icon1"
import VuesaxlineardollarSquareIcon from "./vuesaxlineardollar-square-icon"
import VuesaxlinearlocationTickIcon from "./vuesaxlinearlocation-tick-icon"
import styles from "./frame-component11.module.css"

export type FrameComponent11Type = {
  className?: string;
  property?: any;
};

const FrameComponent11: NextPage<FrameComponent11Type> = ({
  className = "",
  property,
}) => {
  return (
    <section className={[styles.inDetailParent, className].join(" ")}>
      <div className={styles.inDetail}>In Detail</div>
      <div className={styles.detailIcons}>
        <div className={styles.detailIconLayout}>
          <VuesaxlinearcameraIcon />
          <div className={styles.photos}>Photos</div>
        </div>
        <button className={styles.detailIconLayout1}>
          <Vuesaxlinearnote2Icon />
          <div className={styles.details}>Details</div>
        </button>
        <div className={styles.detailIconLayout2}>
          <VuesaxlinearstarIcon1 />
          <div className={styles.features}>Features</div>
        </div>
        <div className={styles.detailIconLayout3}>
          <VuesaxlineardollarSquareIcon />
          <div className={styles.prices}>Prices</div>
        </div>
        <div className={styles.detailIconLayout3}>
          <VuesaxlinearlocationTickIcon />
          <div className={styles.map}>Map</div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent11;
