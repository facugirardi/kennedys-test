import type { NextPage } from "next";
import Link from "next/link";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import { useMemo, type CSSProperties } from "react";
import IconSocialInstagram from "./icon-social-instagram"
import IconLinkedin from "./icon-linkedin"
import IconSocialTiktok from "./icon-social-tiktok"
import styles from "./footer.module.css"
import { useContact } from "@/src/contexts/ContactContext"

export type FooterType = {
  className?: string;
  logo?: string;
  image13?: string;
  image16?: string;

  /** Style props */
  propBackgroundImage?: CSSProperties["backgroundImage"];
  propBackgroundImage1?: CSSProperties["backgroundImage"];
  propBackgroundImage2?: CSSProperties["backgroundImage"];
  propBackgroundImage3?: CSSProperties["backgroundImage"];
  propBackgroundImage4?: CSSProperties["backgroundImage"];
  propBackgroundImage5?: CSSProperties["backgroundImage"];
};

const Footer: NextPage<FooterType> = ({
  className = "",
  propBackgroundImage,
  propBackgroundImage1,
  propBackgroundImage2,
  propBackgroundImage3,
  propBackgroundImage4,
  propBackgroundImage5,
  logo,
  image13,
  image16,
}) => {
  const imageGalleryStyle: CSSProperties = useMemo(() => {
    return {
      backgroundImage: propBackgroundImage,
    };
  }, [propBackgroundImage]);

  const imageStyle: CSSProperties = useMemo(() => {
    return {
      backgroundImage: propBackgroundImage1,
    };
  }, [propBackgroundImage1]);

  const image1Style: CSSProperties = useMemo(() => {
    return {
      backgroundImage: propBackgroundImage2,
    };
  }, [propBackgroundImage2]);

  const image2Style: CSSProperties = useMemo(() => {
    return {
      backgroundImage: propBackgroundImage3,
    };
  }, [propBackgroundImage3]);

  const image3Style: CSSProperties = useMemo(() => {
    return {
      backgroundImage: propBackgroundImage4,
    };
  }, [propBackgroundImage4]);

  const image4Style: CSSProperties = useMemo(() => {
    return {
      backgroundImage: propBackgroundImage5,
    };
  }, [propBackgroundImage5]);

  return (
    <section className={[styles.footer, className].join(" ")}>
      <div className={styles.footer1}>
        <div className={styles.travelDesign}>
          <div className={styles.title}>
            <div className={styles.title1}>
              <div className={styles.travelDesign1}>TRAVEL DESIGN</div>
              <h1 className={styles.exploreTheWorld}>EXPLORE the world</h1>
              <h1
                className={styles.withOurOwn}
              >{`With OUR OWN TRAVEL AGENCY `}</h1>
            </div>
          </div>
          <div className={styles.title2}>
            <div className={styles.fromPlanningTo}>
              From Planning to Booking, We Handle Every Detail
            </div>
            <button className={styles.buttons} onClick={openContactForm}>
              <div className={styles.label}>Start Your Stress-Free Journey</div>
              <img className={styles.vectorIcon} alt="" src="/vector.svg" />
            </button>
          </div>
          <div className={styles.images}>
            <div className={styles.imageGallery} style={imageGalleryStyle}>
              <button className={styles.imageCaptions}>
                <div className={styles.explore}>EXPLORE</div>
              </button>
            </div>
            <div className={styles.image} style={imageStyle}>
              <button className={styles.unwindWrapper}>
                <div className={styles.unwind}>UNWIND</div>
              </button>
            </div>
            <div className={styles.image1} style={image1Style}>
              <button className={styles.experienceWrapper}>
                <div className={styles.experience}>Experience</div>
              </button>
            </div>
            <div className={styles.image2} style={image2Style}>
              <button className={styles.inspireWrapper}>
                <div className={styles.inspire}>INSPIRE</div>
              </button>
            </div>
            <div className={styles.image3} style={image3Style}>
              <button className={styles.adventureWrapper}>
                <div className={styles.adventure}>ADVENTURE</div>
              </button>
            </div>
            <div className={styles.image4} style={image4Style}>
              <button className={styles.discoverWrapper}>
                <div className={styles.discover}>Discover</div>
              </button>
            </div>
          </div>
        </div>
        <div className={styles.blue}>
          <div className={styles.col}>
            <div className={styles.popularLocations}>Popular Locations</div>
            <div className={styles.locationLists}>
              <div className={styles.mykonosBodrumIbizaContainer}>
                <p className={styles.mykonos}>{`Mykonos `}</p>
                <p className={styles.mykonos}>{`Bodrum `}</p>
                <p className={styles.mykonos}>{`Ibiza `}</p>
                <p className={styles.mykonos}>{`Antiparos `}</p>
              </div>
              <div className={styles.athensRivieraCreteContainer}>
                <p className={styles.mykonos}>{`Athens Riviera `}</p>
                <p className={styles.mykonos}>{`Crete `}</p>
                <p className={styles.mykonos}>{`Greek Islands `}</p>
                <p className={styles.mykonos}>{`Meganisi `}</p>
              </div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.luxuryVillasFor}>Luxury Villas for Rent</div>
            <div className={styles.mykonosVillasBodrumVillasIWrapper}>
              <div className={styles.mykonosVillasBodrumVillasContainer}>
                <p className={styles.mykonos}>Mykonos VillasBodrum Villas</p>
                <p className={styles.mykonos}>Ibiza Villas</p>
                <p className={styles.mykonos}>Tulum Villas</p>
              </div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.popularServices}>Popular Services</div>
            <div className={styles.chauffeurCarRentalYachtsPrParent}>
              <div className={styles.mykonosVillasBodrumVillasContainer}>
                <p className={styles.mykonos}>Chauffeur</p>
                <p className={styles.mykonos}>Car Rental</p>
                <p className={styles.mykonos}>Yachts</p>
                <p className={styles.mykonos}>Private Chef</p>
              </div>
              <div className={styles.privateSecurityKidsContainer}>
                <p className={styles.mykonos}>Private Security</p>
                <p className={styles.mykonos}>Kids Entertainment</p>
                <p className={styles.mykonos}>Helicopter Flights</p>
              </div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.luxuryVillasFor1}>
              Luxury Villas for Sale
            </div>
            <div className={styles.mykonosVillasBodrumVillasIWrapper}>
              <div className={styles.mykonosVillasBodrumVillasContainer}>
                <p className={styles.mykonos}>Mykonos VillasBodrum Villas</p>
                <p className={styles.mykonos}>Ibiza Villas</p>
                <p className={styles.mykonos}>Tulum Villas</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.blue1}>
          <div className={styles.col4}>
            <div className={styles.villas}>Villas</div>
            <div className={styles.concierge}>Concierge</div>
            <div className={styles.concierge}>Events</div>
            <div className={styles.concierge}>Real Estate</div>
            <div className={styles.villas}>Travel Design</div>
          </div>
          <div className={styles.col4}>
            <div className={styles.weManage}>We Manage</div>
            <div className={styles.concierge}>About Us</div>
            <div className={styles.weManage}>We are on the News</div>
            <OpenNavbarContact contactPreset="CONCIERGE" className={styles.concierge}>
              Contact Us
            </OpenNavbarContact>
            <div className={styles.concierge}>Sitemap</div>
          </div>
          <div className={styles.col6}>
            <div className={styles.officeLocations}>
              <div className={styles.popularServices}>{`Athens Office `}</div>
              <div className={styles.dimarchouAggelouMetaxaContainer}>
                <p className={styles.mykonos}>
                  Dimarchou Aggelou Metaxa 21 Glyfada, 166 75, Athens,
                </p>
                <p className={styles.mykonos}>Greece +30 22890 28233</p>
              </div>
            </div>
            <div className={styles.officeLocations}>
              <div className={styles.popularServices}>{`Mykonos Office `}</div>
              <div className={styles.argirena84600}>
                Argirena, 846 00, Mykonos, Greece +30 22890 28233
              </div>
            </div>
          </div>
          <div className={styles.col7}>
            <div className={styles.buttons1}>
              <div className={styles.label1}>Sign up form our newsletter</div>
              <img className={styles.vectorIcon} alt="" src="/vector-71.svg" />
            </div>
            <img className={styles.logoIcon} loading="lazy" alt="" src={logo} />
            <div className={styles.socialIcons}>
              <img
                className={styles.iconBrandFacebookColor}
                loading="lazy"
                alt=""
                src="/icon--brandfacebookcolor-1.svg"
              />
              <IconSocialInstagram iconSocialInstagram="/icon--socialinstagram-1.svg" />
              <IconLinkedin iconLinkedin="/icon--linkedin-1.svg" />
              <IconSocialTiktok iconSocialTiktok="/icon--socialtiktok-1.svg" />
            </div>
          </div>
        </div>
        <div className={styles.partners}>
          <div className={styles.partnersList}>
            <div className={styles.partners1}>Partners</div>
            <img
              className={styles.image10Icon}
              loading="lazy"
              alt=""
              src="/image-10@2x.png"
            />
            <img
              className={styles.image11Icon}
              loading="lazy"
              alt=""
              src="/image-11@2x.png"
            />
            <img
              className={styles.image12Icon}
              loading="lazy"
              alt=""
              src="/image-12@2x.png"
            />
            <img
              className={styles.image13Icon}
              loading="lazy"
              alt=""
              src={image13}
            />
            <img
              className={styles.image14Icon}
              loading="lazy"
              alt=""
              src="/image-14@2x.png"
            />
            <img
              className={styles.image15Icon}
              loading="lazy"
              alt=""
              src="/image-15@2x.png"
            />
            <img
              className={styles.image16Icon}
              loading="lazy"
              alt=""
              src={image16}
            />
          </div>
        </div>
        <footer className={styles.bottom}>
          <div className={styles.kennedysGroupVacation}>
            © 2026 Kennedys Group Vacation Rentals - Terms - Privacy
          </div>
        </footer>
        <div className={styles.whatsap}>
          <img
            className={styles.vuesaxlinearmessagesIcon}
            loading="lazy"
            alt=""
            src="/vuesaxlinearmessages.svg"
          />
        </div>
      </div>
    </section>
  );
};

export default Footer;
