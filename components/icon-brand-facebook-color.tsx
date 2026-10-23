import type { NextPage } from "next";
import styles from "./icon-brand-facebook-color.module.css"

export type IconBrandFacebookColorType = {
  className?: string;
};

const IconBrandFacebookColor: NextPage<IconBrandFacebookColorType> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.iconBrandFacebookColor, className].join(" ")}
      alt=""
      src="/icon--brandfacebookcolor2.svg"
    />
  );
};

export default IconBrandFacebookColor;
