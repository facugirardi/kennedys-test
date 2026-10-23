import type { NextPage } from "next";
import styles from "./icon-up-down.module.css"

export type IconUpDownType = {
  className?: string;
  trailingIcon?: string;
};

const IconUpDown: NextPage<IconUpDownType> = ({
  className = "",
  trailingIcon,
}) => {
  return (
    <img
      className={[styles.trailingIcon, className].join(" ")}
      alt=""
      src={trailingIcon}
    />
  );
};

export default IconUpDown;
