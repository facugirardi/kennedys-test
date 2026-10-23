/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import IconBrandFacebookColor1 from "../icon-brand-facebook-color1";
import IconSocialInstagram from "../icon-social-instagram";
import IconLinkedin from "../icon-linkedin";
import IconSocialTiktok from "../icon-social-tiktok";
import VuesaxlinearmessagesIcon from "../vuesaxlinearmessages-icon";
import { useRouter } from "next/router";
import { ChevronRight } from "lucide-react";
import { useContact } from "@/src/contexts/ContactContext";
import { fetchAPI } from "@/lib/api/fetcher";
import { resolveMediaUrl } from "@/lib/utils";

const FALLBACK_PARTNERS = [
  { id: "f1", avatarUrl: null, src: "/images/image-10@2x.png", extra: null },
  { id: "f2", avatarUrl: null, src: "/images/image-11@2x.png", extra: null },
  { id: "f3", avatarUrl: null, src: "/images/image-12@2x.png", extra: null },
  { id: "f4", avatarUrl: null, src: "/images/image-13@2x.png", extra: null },
  { id: "f5", avatarUrl: null, src: "/images/image-14@2x.png", extra: null },
  { id: "f6", avatarUrl: null, src: "/images/image-15@2x.png", extra: null },
  { id: "f7", avatarUrl: null, src: "/images/image-16@2x.png", extra: null },
];

const Footer = ({ disableTravelSection }) => {
  const router = useRouter();
  const { openContactForm } = useContact();
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetchAPI("/content/partners?published=true&pageSize=50")
      .then((resp) => {
        const items = resp?.data?.items;
        if (Array.isArray(items) && items.length > 0) {
          setPartners(items);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section
      className={
        router.pathname === "/kennedys-villas-list" ? "relative" : styles.footer
      }
    >
      <div className={disableTravelSection ? "" : styles.footer1}>
        {!disableTravelSection && (
          <div className={styles.travelDesign}>
            <div className={styles.title}>
              <div className={styles.title1}>
                <div className={styles.travelDesign1}>TRAVEL DESIGN</div>
                <h1 className={styles.exploreTheWorld}>EXPLORE the world</h1>
                <h1 className={styles.withOurOwn}>
                  {"With OUR OWN TRAVEL AGENCY"}
                </h1>
              </div>
            </div>

            <div className={styles.title2}>
              <div className={styles.fromPlanningTo}>
                From Planning to Booking, We Handle Every Detail
              </div>
              <button className={styles.buttons2} onClick={openContactForm}>
                <div className={styles.label2}>Start Your Stress-Free Journey</div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className={styles.images}>
              <div className={styles.categoryImages}>
                <div className={styles.categoryLabels}>
                  <a className={styles.explore}>EXPLORE</a>
                </div>
              </div>

              <div className={styles.image}>
                <button className={styles.unwindWrapper}>
                  <div className={styles.unwind}>UNWIND</div>
                </button>
              </div>

              <div className={styles.image1}>
                <button className={styles.experienceWrapper}>
                  <div className={styles.experience}>Experience</div>
                </button>
              </div>

              <div className={styles.image2}>
                <button className={styles.inspireWrapper}>
                  <div className={styles.inspire}>INSPIRE</div>
                </button>
              </div>

              <div className={styles.image3}>
                <button className={styles.adventureWrapper}>
                  <div className={styles.adventure1}>ADVENTURE</div>
                </button>
              </div>

              <div className={styles.image4}>
                <button className={styles.discoverWrapper}>
                  <div className={styles.discover}>Discover</div>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.blue}>
          <div className={styles.col}>
            <div className={styles.popularLocations}>
              <b>Popular Locations</b>
            </div>

            <div className={styles.locationLists}>
              <div className={styles.mykonosBodrumIbizaContainer}>
                <p className={styles.discoverYour}>{"Mykonos "}</p>
                <p className={styles.discoverYour}>{"Bodrum "}</p>
                <p className={styles.discoverYour}>{"Ibiza "}</p>
                <p className={styles.discoverYour}>{"Antiparos "}</p>
              </div>

              <div className={styles.athensRivieraCreteContainer}>
                <p className={styles.discoverYour}>{"Athens Riviera "}</p>
                <p className={styles.discoverYour}>{"Crete "}</p>
                <p className={styles.discoverYour}>{"Greek Islands "}</p>
                <p className={styles.discoverYour}>{"Meganisi "}</p>
              </div>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.luxuryVillasFor}>
              <b>Luxury Villas for Rent</b>
            </div>

            <div className={styles.mykonosVillasBodrumVillasIWrapper}>
              <div className={styles.mykonosVillasBodrumVillasContainer}>
                <p className={styles.discoverYour}>Mykonos VillasBodrum Villas</p>
                <p className={styles.discoverYour}>Ibiza Villas</p>
                <p className={styles.discoverYour}>Tulum Villas</p>
              </div>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.popularServices}>
              <b>Popular Services</b>
            </div>

            <div className={styles.chauffeurCarRentalYachtsPrParent}>
              <div className={styles.mykonosVillasBodrumVillasContainer}>
                <p className={styles.discoverYour}>Chauffeur</p>
                <p className={styles.discoverYour}>Car Rental</p>
                <p className={styles.discoverYour}>Yachts</p>
                <p className={styles.discoverYour}>Private Chef</p>
              </div>

              <div className={styles.privateSecurityKidsContainer}>
                <p className={styles.discoverYour}>Private Security</p>
                <p className={styles.discoverYour}>Kids Entertainment</p>
                <p className={styles.discoverYour}>Helicopter Flights</p>
              </div>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.luxuryVillasFor1}>
              <b>Luxury Villas for Sale</b>
            </div>

            <div className={styles.mykonosVillasBodrumVillasIWrapper}>
              <div className={styles.mykonosVillasBodrumVillasContainer}>
                <p className={styles.discoverYour}>Mykonos VillasBodrum Villas</p>
                <p className={styles.discoverYour}>Ibiza Villas</p>
                <p className={styles.discoverYour}>Tulum Villas</p>
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
            <div className={styles.concierge}>Contact Us</div>
            <div className={styles.concierge}>Sitemap</div>
          </div>

          <div className={styles.col6}>
            <div className={styles.officeAddresses}>
              <div className={styles.popularServices}>{"Athens O f f ice "}</div>
              <div className={styles.dimarchouAggelouMetaxaContainer}>
                <p className={styles.discoverYour}>
                  Dimarchou Aggelou Metaxa 21 Glyfada, 166 75, Athens,
                </p>
                <p className={styles.discoverYour}>Greece +30 22890 28233</p>
              </div>
            </div>

            <div className={styles.officeAddresses}>
              <div className={styles.popularServices}>{"Mykonos  O f fice "}</div>
              <div className={styles.argirena84600}>
                Argirena, 846 00, Mykonos, Greece +30 22890 28233
              </div>
            </div>
          </div>

          <div className={styles.col7}>
            <div className={styles.buttons3}>
              <div className={styles.label3}>Sign up form our newsletter</div>
              <img className={styles.vectorIcon} alt="" src="/images/vector-71.svg" />
            </div>

            <img
              className={styles.logoIcon}
              loading="lazy"
              alt="logo"
              src="/images/logo.svg"
            />

            <div className={styles.socialIcons}>
              <IconBrandFacebookColor1 iconBrandFacebookColor="/images/icon--brandfacebookcolor-1.svg" />
              <IconSocialInstagram iconSocialInstagram="/images/icon--socialinstagram-1.svg" />
              <IconLinkedin iconLinkedin="/images/icon--linkedin-1.svg" />
              <IconSocialTiktok iconSocialTiktok="/images/icon--socialtiktok-1.svg" />
            </div>
          </div>
        </div>

        <div className={styles.partners}>
          <div className={styles.partnerLogos}>
            <div className={styles.partners1}>Partners</div>
            {(partners.length > 0 ? partners : FALLBACK_PARTNERS).map((p) => {
              const src = p.avatarUrl ? resolveMediaUrl(p.avatarUrl) : p.src;
              const href = p.extra?.link || null;
              const img = (
                <img
                  key={p.id}
                  className={styles.image10Icon}
                  loading="lazy"
                  alt={p.title || "Partner"}
                  src={src}
                  style={{ objectFit: "contain" }}
                />
              );
              return href ? (
                <a key={p.id} href={href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center" }}>
                  {img}
                </a>
              ) : img;
            })}
          </div>
        </div>

        <footer className={styles.bottom}>
          <div className={styles.kennedysGroupVacation}>
            © 2026 Kennedys Group Vacation Rentals -{" "}
            <a href="/terms" className={styles.footerLink}>Terms</a>{" "}-{" "}
            <a href="/privacy" className={styles.footerLink}>Privacy</a>
          </div>
        </footer>

        <div className={styles.whatsap}>
          <VuesaxlinearmessagesIcon vuesaxlinearmessages="/images/vuesaxlinearmessages.svg" />
        </div>
      </div>
    </section>
  );
};

export default Footer;
