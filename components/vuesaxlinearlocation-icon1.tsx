import type { NextPage } from "next";
import styles from "./vuesaxlinearlocation-icon1.module.css"

export type VuesaxlinearlocationIcon1Type = {
  className?: string;
};

const VuesaxlinearlocationIcon1: NextPage<VuesaxlinearlocationIcon1Type> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.vuesaxlinearlocationIcon, className].join(" ")}
      loading="lazy"
      alt=""
      src="/vuesaxlinearlocation.svg"
    />
  );
};

export default VuesaxlinearlocationIcon1;
