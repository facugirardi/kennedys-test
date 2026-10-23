import type { NextPage } from "next";
import Vuesaxlinearhierarchy from "./vuesaxlinearhierarchy"
import styles from "./frame-component20.module.css"

export type FrameComponent20Type = {
  className?: string;
};

const FrameComponent20: NextPage<FrameComponent20Type> = ({
  className = "",
}) => {
  return (
    <section className={[styles.frameParent, className].join(" ")}>
      <div className={styles.chaufferInRangeRoverParent}>
        <h1 className={styles.chaufferInRange}>Chauffer in Range Rover</h1>
        <div className={styles.actionButtons}>
          <div className={styles.saveButton}>
            <img
              className={styles.vuesaxlinearheartIcon}
              loading="lazy"
              alt=""
            />
            <div className={styles.save}>Save</div>
          </div>
          <div className={styles.shareButton}>
            <Vuesaxlinearhierarchy vuesaxlinearhierarchy2="pending_I972:7457;1:169320" />
            <div className={styles.share}>Share</div>
          </div>
        </div>
      </div>
      <div className={styles.roverDescription}>
        <div
          className={styles.the2020Land}
        >{`The 2020 Land Rover Range Rover Sport is the second from the top Range Rover rung, and as the name implies, it’s a smaller and sportier entry than its big brother, the Range Rover full stop. It’s also less spacious and overtly luxurious, with a price that’s appropriately lower as a result. Despite these facts, when compared to other luxury SUVs, the Range Rover Sport is actually bigger, pricier and less sporty than most, while also being more overtly luxurious. `}</div>
        <div className={styles.the2020Land}>
          Admittedly, this is all very confusing, but suffice to say, the Sport
          offers compelling design, go-anywhere capability and an intriguing
          lineup of engines that range from a thrifty diesel to the 575
          horsepower SVR model that growls, crackles and pops like a Jaguar
          F-Type R. That’s something its sophisticated big brother never does.
        </div>
      </div>
    </section>
  );
};

export default FrameComponent20;
