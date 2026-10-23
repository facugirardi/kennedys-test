import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./vuesaxlinearheart-icon.module.css"

export type VuesaxlinearheartIconType = {
  className?: string;
  vuesaxlinearheart?: string;

  /** Style props */
  propPosition?: CSSProperties["position"];
  propTop?: CSSProperties["top"];
  propLeft?: CSSProperties["left"];
};

const VuesaxlinearheartIcon: NextPage<VuesaxlinearheartIconType> = ({
  className = "",
  vuesaxlinearheart,
  propPosition,
  propTop,
  propLeft,
}) => {
  const vuesaxlinearheartIcon1Style: CSSProperties = useMemo(() => {
    return {
      position: propPosition,
      top: propTop,
      left: propLeft,
    };
  }, [propPosition, propTop, propLeft]);

  return (
    <img
      className={[styles.vuesaxlinearheartIcon, className].join(" ")}
      alt=""
      src={vuesaxlinearheart}
      style={vuesaxlinearheartIcon1Style}
    />
  );
};

export default VuesaxlinearheartIcon;
