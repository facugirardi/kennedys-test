import type { NextPage } from "next";
import Link from "next/link";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import { useState, useCallback } from "react";
import PortalPopup from "./portal-popup"
import Contact from "./contact"
import IconPhone from "./icon-phone"
import { useRouter } from "next/router";
import NavvuesaxlinearProperty38Icon from "./navvuesaxlinear-property38-icon"
import NavvuesaxlinearProperty37Icon from "./navvuesaxlinear-property37-icon"
import FieldLabelContainer from "./field-label-container"
import FieldTypes from "./field-types"
import BedroomsAndBudget from "./bedrooms-and-budget"
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import ServicesWrapper from "./services-wrapper"
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import ServicesCard from "./services-card"
import IconBrandFacebookColor1 from "./icon-brand-facebook-color1"
import IconSocialInstagram from "./icon-social-instagram"
import IconLinkedin from "./icon-linkedin"
import IconSocialTiktok from "./icon-social-tiktok"
import VuesaxlinearheartIcon from "./vuesaxlinearheart-icon"
import VuesaxlinearmessagesIcon from "./vuesaxlinearmessages-icon"
import styles from "./navigation1.module.css"

export type Navigation1Type = {
  className?: string;
};


// CONCIERGE LIST

const Navigation1: NextPage<Navigation1Type> = ({ className = "" }) => {
  const [isContactOpen, setContactOpen] = useState(false);
  const router = useRouter();


  const openContact = useCallback(() => {
    setContactOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  const onVacationRentalsTextClick = useCallback(() => {
    router.push("/kennedys-villas");
  }, [router]);

  const onConciergeTextClick = useCallback(() => {
    router.push("/kennedys-concierge");
  }, [router]);

  const onEventsTextClick = useCallback(() => {
    router.push("/kennedys-events");
  }, [router]);

  const onRealEstateTextClick = useCallback(() => {
    router.push("/real-estate");
  }, [router]);

  const onWeManageYourClick = useCallback(() => {
    router.push("/we-manage");
  }, [router]);

  const onButtonsContainerClick = useCallback(() => {
    router.push("/kennedys-concierge-list-men");
  }, [router]);

  const onAdditionalCardsContainerClick = useCallback(() => {
    router.push("/kennedys-concierge-in-mykonos");
  }, [router]);

  return (
    <>
      <section className={[styles.navigation, className].join(" ")}>
        <header className={styles.navFinal}>
          <div className={styles.topMenu}>
            <div className={styles.button}>
              <IconPhone iconPhone="pending_I463:192342;1215:7099" />
              <a className={styles.a} href="tel:+302108947139" target="_blank">
                +30 21089 47139
              </a>
            </div>
            <div className={styles.button1}>
              <img className={styles.vuesaxlinearsmsIcon} alt="" />
              <div className={styles.contact}>Contact</div>
            </div>
          </div>
          <div className={styles.topNav}>
            <nav className={styles.pageLinks}>
              <div
                className={styles.vacationRentals}
                onClick={onVacationRentalsTextClick}
              >
                Vacation Rentals
              </div>
              <div
                className={styles.concierge}
                onClick={onConciergeTextClick}
              >
                Concierge
              </div>
              <div className={styles.events} onClick={onEventsTextClick}>
                Events
              </div>
              <div
                className={styles.realEstate}
                onClick={onRealEstateTextClick}
              >
                Real Estate
              </div>
            </nav>
            <img className={styles.capa1Icon} loading="lazy" alt="" />
            <div className={styles.right}>
              <div
                className={styles.weManageYour}
                onClick={onWeManageYourClick}
              >
                We Manage Your2 Villas
              </div>
              <div className={styles.image}>
                <img className={styles.imageIcon} alt="" />
                <NavvuesaxlinearProperty38Icon navvuesaxlinearProperty39="pending_I463:192342;1215:7136" />
              </div>
              <NavvuesaxlinearProperty37Icon navvuesaxlinearProperty38="pending_I463:192342;1215:7137" />
            </div>
          </div>
        </header>
        <div className={styles.breadcrumbLinks}>
          <div className={styles.backgroundShape} />
          <div className={styles.breadcumbs}>
            <a className={styles.home}>Home</a>
            <div className={styles.locationLinks}>{`>`}</div>
            <a className={styles.concierge1} onClick={onConciergeTextClick}>
              Concierge
            </a>
            <div className={styles.locationLinks}>{`>`}</div>
            <div className={styles.mykonos}>Mykonos</div>
          </div>
        </div>
        <div className={styles.contentWrapperParent}>
          <div className={styles.contentWrapper}>
            <div className={styles.buttonExamples}>
              <div className={styles.fieldExamples}>
                <FieldLabelContainer
                  propMinWidth="255px"
                  ibiza="Mykonos"
                  propDisplay="inline-block"
                  propMinWidth1="63px"
                  iconChevron="pending_755:5695"
                  propWidth="24px"
                  propHeight="24px"
                />
                <FieldTypes
                  typeOfService="Type of Service"
                  iconChevron="pending_755:5701"
                  propWidth="24px"
                  propHeight="24px"
                />
                {/* <BedroomsAndBudget
                  propWidth="187px"
                  budget="Price Range"
                  propHeight="14px"
                  propGap="-25px"
                  trailingIcon="pending_755:5715"
                /> */}
              </div>
              <div className={styles.buttons} onClick={onButtonsContainerClick}>
                <a className={styles.label}> Filters</a>
                <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="pending_755:5718" />
              </div>
              <button className={styles.buttons1}>
                <a className={styles.label1}>Show 21 Services</a>
                <img className={styles.vectorIcon} alt="" />
              </button>
            </div>
          </div>
          <div className={styles.conciergeHeadingWrapper}>
            <div className={styles.conciergeHeading}>
              <h1 className={styles.conciergeServicesIn}>
                Concierge Services in Mykonos
              </h1>
              <div className={styles.ourConciergeServices}>
                Our concierge services offer unparalleled luxury and
                personalized attention. From bespoke itineraries and 24/7
                support to exclusive access and seamless coordination, we ensure
                every detail is expertly managed to provide you with a truly
                exceptional experience.
              </div>
            </div>
          </div>
          <div className={styles.servicesWrapperParent}>
            <ServicesWrapper
              rectangle52="pending_750:5186"
              rectangle65="pending_750:5187"
              rectangle66="pending_750:5188"
            />
            <div className={styles.row}>
              <div className={styles.block}>
                <h3 className={styles.stars}>5 Stars</h3>
                <div className={styles.indulgeInA}>
                  Indulge in a stress-free getaway with personalized itinerary
                  planning, VIP access, and seamless coordination of your travel
                  needs.
                </div>
              </div>
              <div className={styles.block}>
                <h3 className={styles.stars1}>6 stars</h3>
                <div className={styles.indulgeInA}>
                  Elevate your experience with enhanced services, including 24/7
                  dedicated concierge support, expedited access, and prime
                  seating at top venues and events.
                </div>
              </div>
              <div className={styles.block}>
                <h3 className={styles.stars2}>7 stars</h3>
                <div className={styles.indulgeInA}>
                  Reach for the sky with our most exclusive package, offering
                  unlimited changes to your itinerary, personalized assistance
                  throughout your stay, and access to the most coveted
                  experiences and venues worldwide.
                </div>
              </div>
            </div>
            <button className={styles.buttons2} onClick={openContact}>
              <div className={styles.label2}>Contact Now</div>
              <img className={styles.vectorIcon} alt="" />
            </button>
          </div>
          <div className={styles.cardList}>
            <div
              className={styles.additionalCards}
              onClick={onAdditionalCardsContainerClick}
            >
              <div className={styles.servicesCard}>
                <img className={styles.extraCardBackgrounds} alt="" />
                <div className={styles.heartIconContainers}>
                  <VuesaxlinearheartIcon1
                    vuesaxlinearheart="pending_I594:4971;972:6998"
                    propHeight="18px"
                    propWidth="18px"
                  />
                </div>
                <div className={styles.title}>Yacht Rental</div>
                <div className={styles.ourConciergeServicesContainer}>
                  <p className={styles.whenItComes}>
                    5 Stars - 6 Stars - 7 Stars
                  </p>
                  <p className={styles.whenItComes}>
                    When it comes to top-notch concierge services, our team of
                    concierge experts at Kennedy’s Group is undoubtedly the way
                    to go.
                  </p>
                </div>
                <div className={styles.viewMore}>View More</div>
              </div>
              <ServicesCard
                propAlignSelf="stretch"
                rectangle39="pending_I594:4974;594:4968"
                title="Personalized Itineraries"
                ourConciergeServices={false}
                propFlex="1"
                propWidth="385px"
                propAlignSelf1="unset"
                vuesaxlinearheart="pending_I594:4974;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
              <ServicesCard
                propAlignSelf="unset"
                rectangle39="pending_I750:5208;594:4968"
                title="Jet Charter"
                ourConciergeServices={false}
                propFlex="unset"
                propWidth="385px"
                propAlignSelf1="unset"
                vuesaxlinearheart="pending_I750:5208;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
            </div>
            <div
              className={styles.additionalCards}
              onClick={onAdditionalCardsContainerClick}
            >
              <ServicesCard
                propAlignSelf="unset"
                rectangle39="pending_I594:5062;594:4968"
                title="Helicopter"
                ourConciergeServices={false}
                propFlex="unset"
                propWidth="385px"
                propAlignSelf1="unset"
                vuesaxlinearheart="pending_I594:5062;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
              <ServicesCard
                propAlignSelf="unset"
                rectangle39="pending_I594:5064;594:4968"
                title="Chauffeur Service"
                ourConciergeServices={false}
                propFlex="unset"
                propWidth="385px"
                propAlignSelf1="unset"
                vuesaxlinearheart="pending_I594:5064;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
              <ServicesCard
                propAlignSelf="stretch"
                rectangle39="pending_I750:5203;594:4968"
                title={`Tours & Experiences`}
                ourConciergeServices={false}
                propFlex="1"
                propWidth="385px"
                propAlignSelf1="unset"
                vuesaxlinearheart="pending_I750:5203;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
            </div>
            <div
              className={styles.additionalCards}
              onClick={onAdditionalCardsContainerClick}
            >
              <ServicesCard
                propAlignSelf="unset"
                rectangle39="pending_I594:5212;594:4968"
                title="Security"
                ourConciergeServices={false}
                propFlex="unset"
                propWidth="385px"
                propAlignSelf1="unset"
                vuesaxlinearheart="pending_I594:5212;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
              <ServicesCard
                propAlignSelf="unset"
                rectangle39="pending_I594:5213;594:4968"
                title="Yacht Rental"
                ourConciergeServices={false}
                propFlex="unset"
                propWidth="385px"
                propAlignSelf1="unset"
                vuesaxlinearheart="pending_I594:5213;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
              <ServicesCard
                rectangle39="pending_I594:5214;594:4968"
                title="Chauffeur"
                ourConciergeServices
                vuesaxlinearheart="pending_I594:5214;972:6998"
                propHeight="18px"
                propWidth1="18px"
              />
            </div>
          </div>
          <div className={styles.vectorParent}>
            <img className={styles.groupChild} alt="" />
            <div className={styles.socialIconsContainer}>
              <IconBrandFacebookColor1 iconBrandFacebookColor="pending_637:5599" />
              <IconSocialInstagram iconSocialInstagram="pending_637:5600" />
              <IconLinkedin iconLinkedin="pending_637:5601" />
              <IconSocialTiktok iconSocialTiktok="pending_637:5602" />
            </div>
            <VuesaxlinearheartIcon
              vuesaxlinearheart="pending_637:5603"
              propPosition="absolute"
              propTop="293px"
              propLeft="2.3px"
            />
          </div>
        </div>
        <footer className={styles.footer}>
          <div className={styles.footer1}>
            <div className={styles.blue}>
              <div className={styles.col}>
                <div className={styles.popularLocations}>Popular Locations</div>
                <div className={styles.listContainers}>
                  <div className={styles.mykonosBodrumIbizaContainer}>
                    <p className={styles.whenItComes}>{`Mykonos `}</p>
                    <p className={styles.whenItComes}>{`Bodrum `}</p>
                    <p className={styles.whenItComes}>{`Ibiza `}</p>
                    <p className={styles.whenItComes}>{`Antiparos `}</p>
                  </div>
                  <div className={styles.athensRivieraCreteContainer}>
                    <p className={styles.whenItComes}>{`Athens Riviera `}</p>
                    <p className={styles.whenItComes}>{`Crete `}</p>
                    <p className={styles.whenItComes}>{`Greek Islands `}</p>
                    <p className={styles.whenItComes}>{`Meganisi `}</p>
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.luxuryVillasFor}>
                  Luxury Villas for Rent
                </div>
                <div className={styles.mykonosVillasBodrumVillasIWrapper}>
                  <div className={styles.athensRivieraCreteContainer}>
                    <p className={styles.whenItComes}>
                      Mykonos VillasBodrum Villas
                    </p>
                    <p className={styles.whenItComes}>Ibiza Villas</p>
                    <p className={styles.whenItComes}>Tulum Villas</p>
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.popularServices}>Popular Services</div>
                <div className={styles.chauffeurCarRentalYachtsPrParent}>
                  <div className={styles.athensRivieraCreteContainer}>
                    <p className={styles.whenItComes}>Chauffeur</p>
                    <p className={styles.whenItComes}>Car Rental</p>
                    <p className={styles.whenItComes}>Yachts</p>
                    <p className={styles.whenItComes}>Private Chef</p>
                  </div>
                  <div className={styles.privateSecurityKidsContainer}>
                    <p className={styles.whenItComes}>Private Security</p>
                    <p className={styles.whenItComes}>Kids Entertainment</p>
                    <p className={styles.whenItComes}>Helicopter Flights</p>
                  </div>
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.luxuryVillasFor1}>
                  Luxury Villas for Sale
                </div>
                <div className={styles.mykonosVillasBodrumVillasIWrapper}>
                  <div className={styles.athensRivieraCreteContainer}>
                    <p className={styles.whenItComes}>
                      Mykonos VillasBodrum Villas
                    </p>
                    <p className={styles.whenItComes}>Ibiza Villas</p>
                    <p className={styles.whenItComes}>Tulum Villas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.blue1}>
              <div className={styles.col4}>
                <div className={styles.villas}>Villas</div>
                <div className={styles.villas}>Concierge</div>
                <div className={styles.villas}>Events</div>
                <div className={styles.villas}>Real Estate</div>
                <div className={styles.travelDesign}>Travel Design</div>
              </div>
                <div className={styles.col4}>
                  <div className={styles.villas}>We Manage</div>
                  <div className={styles.villas}>About Us</div>
                  <div className={styles.villas}>We are on the News</div>
                  <OpenNavbarContact className={styles.villas}>
                    Contact Us
                  </OpenNavbarContact>
                  <div className={styles.villas}>Sitemap</div>
                </div>
              <div className={styles.col6}>
                <div className={styles.officeContainers}>
                  <div
                    className={styles.popularServices}
                  >{`Athens Office `}</div>
                  <div className={styles.dimarchouAggelouMetaxaContainer}>
                    <p className={styles.whenItComes}>
                      Dimarchou Aggelou Metaxa 21 Glyfada, 166 75, Athens,
                    </p>
                    <p className={styles.whenItComes}>Greece +30 22890 28233</p>
                  </div>
                </div>
                <div className={styles.officeContainers1}>
                  <div
                    className={styles.popularServices}
                  >{`Mykonos Office `}</div>
                  <div className={styles.argirena84600}>
                    Argirena, 846 00, Mykonos, Greece +30 22890 28233
                  </div>
                </div>
              </div>
              <div className={styles.col7}>
                <div className={styles.buttons3}>
                  <div className={styles.label3}>
                    Sign up form our newsletter
                  </div>
                  <img className={styles.vectorIcon} alt="" />
                </div>
                <img className={styles.logoIcon} loading="lazy" alt="" />
                <div className={styles.socialIcons}>
                  <IconBrandFacebookColor1 iconBrandFacebookColor="pending_I454:5031;1215:7369" />
                  <IconSocialInstagram iconSocialInstagram="pending_I454:5031;1215:7370" />
                  <IconLinkedin iconLinkedin="pending_I454:5031;1215:7371" />
                  <IconSocialTiktok iconSocialTiktok="pending_I454:5031;1215:7372" />
                </div>
              </div>
            </div>
            <div className={styles.partners}>
              <div className={styles.partnerLogos}>
                <div className={styles.partners1}>Partners</div>
                <img className={styles.image10Icon} loading="lazy" alt="" />
                <img className={styles.image11Icon} loading="lazy" alt="" />
                <img className={styles.image12Icon} loading="lazy" alt="" />
                <img className={styles.image13Icon} loading="lazy" alt="" />
                <img className={styles.image14Icon} loading="lazy" alt="" />
                <img className={styles.image15Icon} loading="lazy" alt="" />
                <img className={styles.image16Icon} loading="lazy" alt="" />
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.kennedysGroupVacation}>
                © 2026 Kennedys Group Vacation Rentals - Terms - Privacy
              </div>
            </div>
            <div className={styles.whatsap}>
              <VuesaxlinearmessagesIcon vuesaxlinearmessages="pending_I454:5031;1215:7386" />
            </div>
          </div>
        </footer>
      </section>
      {isContactOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeContact}
        >
          <Contact onClose={closeContact} />
        </PortalPopup>
      )}
    </>
  );
};

export default Navigation1;
