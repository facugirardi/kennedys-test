import type { NextPage } from "next";
import styles from "./vuesaxlinearlocation-tick-icon.module.css"

export type VuesaxlinearlocationTickIconType = {
  className?: string;
};

const VuesaxlinearlocationTickIcon: NextPage<
  VuesaxlinearlocationTickIconType
> = ({ className = "" }) => {
  return (
    <img
      className={[styles.vuesaxlinearlocationTickIcon, className].join(" ")}
      alt=""
      src="/vuesaxlinearlocationtick.svg"
    />
  );
};

export default VuesaxlinearlocationTickIcon;
