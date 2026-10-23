import type { NextPage } from "next";
import styles from "./icon-star.module.css"

export type IconStarType = {
  className?: string;
  iconStar?: string;
};

const IconStar: NextPage<IconStarType> = ({ className = "", iconStar }) => {
  return (
    <img
      className={[styles.iconStar, className].join(" ")}
      alt=""
      src={iconStar}
    />
  );
};

export default IconStar;
