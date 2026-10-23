import type { NextPage } from "next";
import styles from "./vuesaxlinearlocation-icon.module.css"

export type VuesaxlinearlocationIconType = {
  className?: string;
  vuesaxlinearlocation?: string;
};

const VuesaxlinearlocationIcon: NextPage<VuesaxlinearlocationIconType> = ({
  className = "",
  vuesaxlinearlocation,
}) => {
  return (
    <img
      className={[styles.vuesaxlinearlocationIcon, className].join(" ")}
      alt=""
      src={vuesaxlinearlocation}
    />
  );
};

export default VuesaxlinearlocationIcon;
