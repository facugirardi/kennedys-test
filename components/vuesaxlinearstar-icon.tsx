import type { NextPage } from "next";
import styles from "./vuesaxlinearstar-icon.module.css"

export type VuesaxlinearstarIconType = {
  className?: string;
};

const VuesaxlinearstarIcon: NextPage<VuesaxlinearstarIconType> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.vuesaxlinearstarIcon, className].join(" ")}
      alt=""
      src="/vuesaxlinearstar.svg"
    />
  );
};

export default VuesaxlinearstarIcon;
