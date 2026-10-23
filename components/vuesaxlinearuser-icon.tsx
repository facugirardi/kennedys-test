import type { NextPage } from "next";
import styles from "./vuesaxlinearuser-icon.module.css"

export type VuesaxlinearuserIconType = {
  className?: string;
};

const VuesaxlinearuserIcon: NextPage<VuesaxlinearuserIconType> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.vuesaxlinearuserIcon, className].join(" ")}
      alt=""
      src="/vuesaxlinearuser.svg"
    />
  );
};

export default VuesaxlinearuserIcon;
