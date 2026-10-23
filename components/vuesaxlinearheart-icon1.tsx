import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./vuesaxlinearheart-icon1.module.css"

export type VuesaxlinearheartIcon1Type = {
  className?: string;
  vuesaxlinearheart?: string;

  /** Style props */
  propHeight?: CSSProperties["height"];
  propWidth?: CSSProperties["width"];
};

const VuesaxlinearheartIcon1: NextPage<VuesaxlinearheartIcon1Type> = ({
  className = "",
  vuesaxlinearheart,
  propHeight,
  propWidth,
}) => {
  const vuesaxlinearheartIconStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight,
      width: propWidth,
    };
  }, [propHeight, propWidth]);

  return (
    <img
      className={[styles.vuesaxlinearheartIcon, className].join(" ")}
      alt=""
      src={vuesaxlinearheart}
      style={vuesaxlinearheartIconStyle}
    />
  );
};

export default VuesaxlinearheartIcon1;
