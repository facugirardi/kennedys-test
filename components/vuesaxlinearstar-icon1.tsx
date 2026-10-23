import type { NextPage } from "next";
import styles from "./vuesaxlinearstar-icon1.module.css"

export type VuesaxlinearstarIcon1Type = {
  className?: string;
};

const VuesaxlinearstarIcon1: NextPage<VuesaxlinearstarIcon1Type> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.vuesaxlinearstarIcon, className].join(" ")}
      alt=""
      src="/vuesaxlinearstar1.svg"
    />
  );
};

export default VuesaxlinearstarIcon1;
