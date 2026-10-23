import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./dateinactive.module.css"

export type DateinactiveType = {
  className?: string;
  prop?: string;

  /** Style props */
  propFlex?: CSSProperties["flex"];
  propWidth?: CSSProperties["width"];
  propBorderRadius?: CSSProperties["borderRadius"];
  propBackgroundColor?: CSSProperties["backgroundColor"];
  propColor?: CSSProperties["color"];
};

const Dateinactive: NextPage<DateinactiveType> = ({
  className = "",
  propFlex,
  propWidth,
  propBorderRadius,
  propBackgroundColor,
  prop,
  propColor,
}) => {
  const dateinactiveStyle: CSSProperties = useMemo(() => {
    return {
      flex: propFlex,
      width: propWidth,
      borderRadius: propBorderRadius,
      backgroundColor: propBackgroundColor,
    };
  }, [propFlex, propWidth, propBorderRadius, propBackgroundColor]);

  const divStyle: CSSProperties = useMemo(() => {
    return {
      color: propColor,
    };
  }, [propColor]);

  return (
    <div
      className={[styles.dateinactive, className].join(" ")}
      style={dateinactiveStyle}
    >
      <div className={styles.div} style={divStyle}>
        {prop}
      </div>
    </div>
  );
};

export default Dateinactive;
