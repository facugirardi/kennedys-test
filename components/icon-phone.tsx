import type { NextPage } from "next";
import styles from "./icon-phone.module.css"

export type IconPhoneType = {
  className?: string;
  iconPhone?: string;
};

const IconPhone: NextPage<IconPhoneType> = ({ className = "", iconPhone }) => {
  return (
    <img
      className={[styles.iconPhone, className].join(" ")}
      alt=""
      src={iconPhone}
    />
  );
};

export default IconPhone;
