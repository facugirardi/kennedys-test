import type { NextPage } from "next";
import styles from "./icon-close.module.css"

export type IconCloseType = {
  className?: string;
};

const IconClose: NextPage<IconCloseType> = ({ className = "" }) => {
  return (
    <img
      className={[styles.trailingIcon, className].join(" ")}
      alt=""
      src="/trailingicon1.svg"
    />
  );
};

export default IconClose;
