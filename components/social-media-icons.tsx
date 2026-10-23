import type { NextPage } from "next";
import VuesaxlinearheartIcon from "./vuesaxlinearheart-icon"
import styles from "./social-media-icons.module.css"

export type SocialMediaIconsType = {
  className?: string;
};

const SocialMediaIcons: NextPage<SocialMediaIconsType> = ({
  className = "",
}) => {
  return (
    <div className={[styles.socialMediaIcons, className].join(" ")}>
      <img
        className={styles.iconBrandFacebookColor}
        loading="lazy"
        alt=""
        src="/icon--brandfacebookcolor.svg"
      />
      <img
        className={styles.iconBrandFacebookColor}
        loading="lazy"
        alt=""
        src="/icon--socialinstagram.svg"
      />
      <img
        className={styles.iconLinkedin}
        loading="lazy"
        alt=""
        src="/icon--linkedin.svg"
      />
      <div className={styles.iconSocialTiktokParent}>
        <img
          className={styles.iconSocialTiktok}
          loading="lazy"
          alt=""
          src="/icon--socialtiktok.svg"
        />
        <div className={styles.frameWrapper}>
          <div className={styles.frameParent}>
            <div className={styles.vectorWrapper}>
              <img className={styles.frameChild} alt="" src="/vector-15.svg" />
            </div>
            <VuesaxlinearheartIcon
              vuesaxlinearheart="/vuesaxlinearheart4.svg"
              propPosition="relative"
              propTop="unset"
              propLeft="unset"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaIcons;
