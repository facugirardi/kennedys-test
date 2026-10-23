import type { NextPage } from "next";
import styles from "./vuesaxlinearcamera-icon.module.css"

export type VuesaxlinearcameraIconType = {
  className?: string;
};

const VuesaxlinearcameraIcon: NextPage<VuesaxlinearcameraIconType> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.vuesaxlinearcameraIcon, className].join(" ")}
      alt=""
      src="/vuesaxlinearcamera.svg"
    />
  );
};

export default VuesaxlinearcameraIcon;
