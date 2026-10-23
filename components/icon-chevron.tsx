import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./icon-chevron.module.css"

export type IconChevronType = {
  className?: string;
  iconChevron?: string;

  /** Style props */
  propWidth?: CSSProperties["width"];
  propHeight?: CSSProperties["height"];
};

const IconChevron: NextPage<IconChevronType> = ({
  className = "",
  iconChevron,
  propWidth,
  propHeight,
}) => {
  const iconChevronStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
      height: propHeight,
    };
  }, [propWidth, propHeight]);

  return (
    <img
      className={[styles.iconChevron, className].join(" ")}
      alt=""
      src={iconChevron}
      style={iconChevronStyle}
    />
  );
};

export default IconChevron;
