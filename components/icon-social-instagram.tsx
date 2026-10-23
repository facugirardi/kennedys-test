import type { NextPage } from "next";
import styles from "./icon-social-instagram.module.css"

export type IconSocialInstagramType = {
  className?: string;
  iconSocialInstagram?: string;
};

const IconSocialInstagram: NextPage<IconSocialInstagramType> = ({
  className = "",
  iconSocialInstagram,
}) => {
  return (
    <img
      className={[styles.iconSocialInstagram, className].join(" ")}
      alt=""
      src={iconSocialInstagram}
    />
  );
};

export default IconSocialInstagram;
