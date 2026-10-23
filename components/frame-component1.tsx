import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./frame-component1.module.css"

export type FrameComponent1Type = {
  className?: string;
  theDecoration?: string;
  vector17?: string;
  thePureEnergyOfLoveAndSpiritu?: string;
  image?: string;

  /** Style props */
  propTop?: CSSProperties["top"];
};

const FrameComponent1: NextPage<FrameComponent1Type> = ({
  className = "",
  propTop,
  theDecoration,
  vector17,
  thePureEnergyOfLoveAndSpiritu,
  image,
}) => {
  const frameSectionStyle: CSSProperties = useMemo(() => {
    return {
      top: propTop,
    };
  }, [propTop]);

  return (
    <section
      className={[styles.leftParent, className].join(" ")}
      style={frameSectionStyle}
    >
      <div className={styles.left}>
        <h1 className={styles.theDecoration}>{theDecoration}</h1>
        <img className={styles.leftChild} alt="" src={vector17} />
        <div className={styles.musicDescription}>
          <div className={styles.thePureEnergy}>
            {thePureEnergyOfLoveAndSpiritu}
          </div>
        </div>
      </div>
      <img className={styles.imageIcon} alt="" src={image} />
    </section>
  );
};

export default FrameComponent1;
