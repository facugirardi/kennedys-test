
import styles from "./socialIcons.module.css"@/components/custom/from "./socialIcons.module.css;
import VuesaxlinearheartIcon from "../vuesaxlinearheart-icon"@/components/custom/from "../vuesaxlinearheart-icon;


// Example usage component
const SocialIcons = ({ className }) => {

    return (
        <div className={[styles.topShapeParent, className].join(" ")}>
            <img className={styles.topShapeIcon} alt="" src="/vector-11.svg" />
            <div className={styles.iconBrandFacebookColorParent}>
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
                <img
                    className={styles.iconBrandFacebookColor}
                    loading="lazy"
                    alt=""
                    src="/icon--socialtiktok.svg"
                />
            </div>
            <VuesaxlinearheartIcon
                vuesaxlinearheart="/vuesaxlinearheart-2.svg"
                propPosition="absolute"
                propTop="293px"
                propLeft="2.3px"
            />
        </div>
    );
};

export default SocialIcons;