import type { NextPage } from "next";
import styles from "./vuesaxlinearmessages-icon.module.css"

export type VuesaxlinearmessagesIconType = {
  className?: string;
  vuesaxlinearmessages?: string;
};

const VuesaxlinearmessagesIcon: NextPage<VuesaxlinearmessagesIconType> = ({
  className = "",
  vuesaxlinearmessages,
}) => {
  return (
    <img
      className={[styles.vuesaxlinearmessagesIcon, className].join(" ")}
      alt=""
      src={vuesaxlinearmessages}
    />
  );
};

export default VuesaxlinearmessagesIcon;
