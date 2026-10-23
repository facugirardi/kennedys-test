import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./frame-component14.module.css"

export type FrameComponent14Type = {
  className?: string;
};

const FrameComponent14: NextPage<FrameComponent14Type> = ({
  className = "",
}) => {
  const router = useRouter();

  const onFrameContainerClick = useCallback(() => {
    router.push("/concierge/list");
  }, [router]);

  return (
    <section className={[styles.whereWrapper, className].join(" ")}>
      <div className={styles.where}>
        <h1 className={styles.whereToFind}>
          Where to Find Our Concierge Services
        </h1>
        <div className={styles.groupParent} onClick={onFrameContainerClick}>
          <img
            className={styles.frameChild}
            loading="lazy"
            alt=""
            src="/group-862@2x.png"
          />
          <div className={styles.locationImages}>
            <div className={styles.cardContainers}>
              <h1 className={styles.mykonos}>MyKONOS</h1>
            </div>
            <div className={styles.cardContainers1}>
              <h1 className={styles.ibiza}>IBIZA</h1>
            </div>
            <div className={styles.image}>
              <h1 className={styles.greekIslands}>GREEK ISLANDS</h1>
            </div>
          </div>
          <div className={styles.bodrumContentParent}>
            <div className={styles.bodrumContent}>
              <img
                className={styles.bodrumShapeIcon}
                loading="lazy"
                alt=""
                src="/vector.svg"
              />
            </div>
            <div className={styles.bodrumBackground} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent14;
