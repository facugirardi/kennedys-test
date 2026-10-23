import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./icon-calendar.module.css"

export type IconCalendarType = {
  className?: string;
  iconCalendar?: string;

  /** Style props */
  propWidth?: CSSProperties["width"];
};

const IconCalendar: NextPage<IconCalendarType> = ({
  className = "",
  iconCalendar,
  propWidth,
}) => {
  const iconCalendarStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  return (
    <img
      className={[styles.iconCalendar, className].join(" ")}
      alt=""
      src={iconCalendar}
      style={iconCalendarStyle}
    />
  );
};

export default IconCalendar;
