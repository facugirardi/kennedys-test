import type { NextPage } from "next";
import styles from "./icon-social-tiktok.module.css"
export type IconSocialTiktokType = {
  className?: string;
  iconSocialTiktok?: string;
};

const IconSocialTiktok: NextPage<IconSocialTiktokType> = ({
  className = "",
  iconSocialTiktok,
}) => {
  return (
    <img
      className={[styles.iconSocialTiktok, className].join(" ")}
      alt=""
      src={iconSocialTiktok}
    />
  );
};

export default IconSocialTiktok;
