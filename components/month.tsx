import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./month.module.css"

export type MonthType = {
  className?: string;
  sAT?: string;

  /** Style props */
  propWidth?: CSSProperties["width"];
};

const Month: NextPage<MonthType> = ({ className = "", sAT, propWidth }) => {
  const sATStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  return (
    <div className={[styles.month, className].join(" ")}>
      <div className={styles.sat} style={sATStyle}>
        {sAT}
      </div>
    </div>
  );
};

export default Month;
