import type { NextPage } from "next";
import VuesaxlinearcameraIcon from "./vuesaxlinearcamera-icon"
import Vuesaxlinearnote2Icon from "./vuesaxlinearnote2-icon"
import VuesaxlinearstarIcon1 from "./vuesaxlinearstar-icon1"
import VuesaxlineardollarSquareIcon from "./vuesaxlineardollar-square-icon"
import VuesaxlinearlocationTickIcon from "./vuesaxlinearlocation-tick-icon"
import styles from "./frame-component4.module.css"

export type FrameComponent4Type = {
  className?: string;
};

const FrameComponent4: NextPage<FrameComponent4Type> = ({ className = "" }) => {
  return (
    <section className={[styles.inDetailParent, className].join(" ")}>
      <div className={styles.inDetail}>In Detail</div>
      <div className={styles.detailIcons}>
        <div className={styles.vuesaxlinearcameraParent}>
          <VuesaxlinearcameraIcon />
          <div className={styles.photos}>Photos</div>
        </div>
        <button className={styles.vuesaxlinearnote2Parent}>
          <Vuesaxlinearnote2Icon />
          <div className={styles.details}>Details</div>
        </button>
        <div className={styles.vuesaxlinearstarParent}>
          <VuesaxlinearstarIcon1 />
          <div className={styles.features}>Features</div>
        </div>
        <div className={styles.vuesaxlineardollarSquareParent}>
          <VuesaxlineardollarSquareIcon />
          <div className={styles.prices}>Prices</div>
        </div>
        <div className={styles.vuesaxlineardollarSquareParent}>
          <VuesaxlinearlocationTickIcon />
          <div className={styles.map}>Map</div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent4;
