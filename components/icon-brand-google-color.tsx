import type { NextPage } from "next";
import styles from "./icon-brand-google-color.module.css"

export type IconBrandGoogleColorType = {
  className?: string;
};

const IconBrandGoogleColor: NextPage<IconBrandGoogleColorType> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.iconBrandGoogleColor, className].join(" ")}
      alt=""
      src="/icon--brandgooglecolor.svg"
    />
  );
};

export default IconBrandGoogleColor;
