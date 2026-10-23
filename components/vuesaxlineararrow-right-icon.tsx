import type { NextPage } from "next";
import styles from "./vuesaxlineararrow-right-icon.module.css"

export type VuesaxlineararrowRightIconType = {
  className?: string;
};

const VuesaxlineararrowRightIcon: NextPage<VuesaxlineararrowRightIconType> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.vuesaxlineararrowRightIcon, className].join(" ")}
      alt=""
      src="/vuesaxlineararrowright.svg"
    />
  );
};

export default VuesaxlineararrowRightIcon;
