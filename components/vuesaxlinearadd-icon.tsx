import type { NextPage } from "next";
import styles from "./vuesaxlinearadd-icon.module.css"

export type VuesaxlinearaddIconType = {
  className?: string;
  vuesaxlinearadd?: string;
};

const VuesaxlinearaddIcon: NextPage<VuesaxlinearaddIconType> = ({
  className = "",
  vuesaxlinearadd,
}) => {
  return (
    <img
      className={[styles.vuesaxlinearaddIcon, className].join(" ")}
      alt=""
      src={vuesaxlinearadd}
    />
  );
};

export default VuesaxlinearaddIcon;
