import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./group-component1.module.css"

export type GroupComponent1Type = {
  className?: string;
  partyImages?: string;
  themedParties?: string;
  partyIcons?: string;
  capa1?: string;

  /** Style props */
  propLeft?: CSSProperties["left"];
  propHeight?: CSSProperties["height"];
  propHeight1?: CSSProperties["height"];
  propHeight2?: CSSProperties["height"];
};

const GroupComponent1: NextPage<GroupComponent1Type> = ({
  className = "",
  propLeft,
  propHeight,
  partyImages,
  propHeight1,
  themedParties,
  propHeight2,
  partyIcons,
  capa1,
}) => {
  const groupDiv2Style: CSSProperties = useMemo(() => {
    return {
      left: propLeft,
      height: propHeight,
    };
  }, [propLeft, propHeight]);

  const partyTypesStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight1,
    };
  }, [propHeight1]);

  const themedPartiesStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight2,
    };
  }, [propHeight2]);

  return (
    <div
      className={[styles.partyInfoParent, className].join(" ")}
      style={groupDiv2Style}
    >
      <div className={styles.partyInfo}>
        <img
          className={styles.partyImagesIcon}
          loading="lazy"
          alt=""
          src={partyImages}
        />
        <div className={styles.partyTypes} style={partyTypesStyle}>
          <h2 className={styles.themedParties} style={themedPartiesStyle}>
            {themedParties}
          </h2>
          <img className={styles.partyIcons} alt="" src={partyIcons} />
        </div>
      </div>
      <div className={styles.shortInfo}>
        <div className={styles.date}>More info</div>
        <img className={styles.capa1Icon} alt="" src={capa1} />
      </div>
    </div>
  );
};

export default GroupComponent1;
