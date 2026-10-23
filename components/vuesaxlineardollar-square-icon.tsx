import type { NextPage } from "next";
import styles from "./vuesaxlineardollar-square-icon.module.css"

export type VuesaxlineardollarSquareIconType = {
  className?: string;
};

const VuesaxlineardollarSquareIcon: NextPage<
  VuesaxlineardollarSquareIconType
> = ({ className = "" }) => {
  return (
    <img
      className={[styles.vuesaxlineardollarSquareIcon, className].join(" ")}
      alt=""
      src="/vuesaxlineardollarsquare.svg"
    />
  );
};

export default VuesaxlineardollarSquareIcon;
