import type { NextPage } from "next";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import IconBrandFacebookColor1 from "./icon-brand-facebook-color1"
import IconSocialInstagram from "./icon-social-instagram"
import IconLinkedin from "./icon-linkedin"
import IconSocialTiktok from "./icon-social-tiktok"
import styles from "./blue.module.css"

export type BlueType = {
  className?: string;
  vector?: string;
  logo?: string;
  iconBrandFacebookColor?: string;
  iconSocialInstagram?: string;
  iconLinkedin?: string;
  iconSocialTiktok?: string;
};

const Blue: NextPage<BlueType> = ({
  className = "",
  vector,
  logo,
  iconBrandFacebookColor,
  iconSocialInstagram,
  iconLinkedin,
  iconSocialTiktok,
}) => {
  return (
    <footer className={[styles.blue, className].join(" ")}>
      <div className={styles.col}>
        <div className={styles.villas}>Villas</div>
        <div className={styles.villas}>Concierge</div>
        <div className={styles.villas}>Events</div>
        <div className={styles.villas}>Real Estate</div>
        <div className={styles.travelDesign}>Travel Design</div>
      </div>
      <div className={styles.col}>
        <div className={styles.villas}>We Manage</div>
        <div className={styles.villas}>About Us</div>
        <div className={styles.villas}>We are on the News</div>
        <OpenNavbarContact className={styles.villas}>
          Contact Us
        </OpenNavbarContact>
        <div className={styles.villas}>Sitemap</div>
      </div>
      <div className={styles.col2}>
        <div className={styles.officeLocations}>
          <div className={styles.athensOffice}>{`Athens Office `}</div>
          <div className={styles.dimarchouAggelouMetaxaContainer}>
            <p className={styles.dimarchouAggelouMetaxa}>
              Dimarchou Aggelou Metaxa 21 Glyfada, 166 75, Athens,
            </p>
            <p className={styles.dimarchouAggelouMetaxa}>
              Greece +30 22890 28233
            </p>
          </div>
        </div>
        <div className={styles.officeLocations1}>
          <div className={styles.athensOffice}>{`Mykonos Office `}</div>
          <div className={styles.argirena84600}>
            Argirena, 846 00, Mykonos, Greece +30 22890 28233
          </div>
        </div>
      </div>
      <div className={styles.col3}>
        <div className={styles.buttons}>
          <div className={styles.label}>Sign up form our newsletter</div>
          <img className={styles.vectorIcon} alt="" src={vector} />
        </div>
        <img className={styles.logoIcon} loading="lazy" alt="" src={logo} />
        <div className={styles.iconBrandFacebookColorParent}>
          <IconBrandFacebookColor1
            iconBrandFacebookColor={iconBrandFacebookColor}
          />
          <IconSocialInstagram iconSocialInstagram={iconSocialInstagram} />
          <IconLinkedin iconLinkedin={iconLinkedin} />
          <IconSocialTiktok iconSocialTiktok={iconSocialTiktok} />
        </div>
      </div>
    </footer>
  );
};

export default Blue;
