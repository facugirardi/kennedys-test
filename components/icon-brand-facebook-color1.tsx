import type { NextPage } from "next";
import styles from "./icon-brand-facebook-color1.module.css"

export type IconBrandFacebookColor1Type = {
  className?: string;
  iconBrandFacebookColor?: string;
};

const IconBrandFacebookColor1: NextPage<IconBrandFacebookColor1Type> = ({
  className = "",
  iconBrandFacebookColor,
}) => {
  return (
    <img
      className={[styles.iconBrandFacebookColor, className].join(" ")}
      alt=""
      src={iconBrandFacebookColor}
    />
  );
};

export default IconBrandFacebookColor1;
