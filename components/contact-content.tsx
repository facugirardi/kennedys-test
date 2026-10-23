import type { NextPage } from "next";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import QuestionOpen from "./question-open"
import IconSocialInstagram from "./icon-social-instagram"
import IconLinkedin from "./icon-linkedin"
import IconSocialTiktok from "./icon-social-tiktok"
import styles from "./contact-content.module.css"

export type ContactContentType = {
  className?: string;
};

const ContactContent: NextPage<ContactContentType> = ({ className = "" }) => {
  return (
    <div className={[styles.contactContent, className].join(" ")}>
        <div className={styles.contactInfo}>
          <div className={styles.contactMessage}>
            <div className={styles.contactCallToAction}>
              <div className={styles.contactButtonContainer}>
                <h1 className={styles.weAreHereContainer}>
                  <p className={styles.weAreHere}>WE ARE HERE</p>
                  <p className={styles.forYou}>FOR YOU</p>
                </h1>
                <div className={styles.propertyManagementCan}>
                  Property Management can be complex, but our experienced team
                  makes it simple and stress-free. We handle all the details,
                  keeping you informed every step of the way, so you can relax
                  and enjoy your investment.
                </div>
                <div className={styles.wereAlwaysAvailableContainer}>
                  <p className={styles.weAreHere}>
                    <span
                      className={styles.wereAlwaysAvailable}
                    >{`We're always available to discuss any questions or issues and can arrange a call or meeting to explain the process in detail. Don’t hesitate to email us at  `}</span>
                    <a
                      className={styles.reservationskennedysgroupcom}
                      href="mailto:reservations@kennedysgroup.com"
                      target="_blank"
                    >
                      <span>
                        <span className={styles.reservationskennedysgroupcom1}>
                          reservations@kennedysgroup.com
                        </span>
                      </span>
                    </a>
                    <span> </span>
                  </p>
                  <p className={styles.weAreHere}>
                    <span className={styles.wereAlwaysAvailable}>
                      or give us a call at +30 6980960467 
                    </span>
                  </p>
                </div>
                <OpenNavbarContact className={styles.buttons}>
                  <div className={styles.label}>Contact Us</div>
                  <img className={styles.vectorIcon} alt="" src="/vector.svg" />
                </OpenNavbarContact>
              </div>
            </div>
          </div>
          <div className={styles.servicesContentParent}>
            <div className={styles.servicesContent}>
              <div className={styles.galleryContainer}>
                <div className={styles.capa1} />
                <div className={styles.galleryContainerChild} />
                <div className={styles.questionListParent}>
                  <div className={styles.questionList}>
                    <div className={styles.imageThree}>
                      <img
                        className={styles.imageThreeChild}
                        alt=""
                        src="/rectangle-514@2x.png"
                      />
                      <img
                        className={styles.imageThreeItem}
                        alt=""
                        src="/group-1053@2x.png"
                      />
                    </div>
                  </div>
                  <div className={styles.frameParent}>
                    <img
                      className={styles.frameChild}
                      alt=""
                      src="/group-1064@2x.png"
                    />
                    <img
                      className={styles.frameItem}
                      loading="lazy"
                      alt=""
                      src="/group-1083@2x.png"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.questions}>
                <h1 className={styles.ourServices}>OUR SERVICES</h1>
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire="A to Z Property Consultancy"
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire={`Correct Positioning & High Competency on Market  `}
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire={`Property Photo Shooting & Digital Presence`}
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire={`Rate Analysis & Pricelist Plan`}
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire={`Reservations & Booking Management`}
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="241px"
                  marketingToolsPromotionInDire={`Marketing Tools & Promotion in Direct & Third-Party Channels`}
                  propMargin="0"
                  propFontWeight="400"
                  group101="/group-101-5@2x.png"
                  afterThePositioning
                  propWidth="802px"
                  propHeight1="104px"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire={`Reservations & Booking Management`}
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire="Guests’ Check-In"
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire="Live Support for each booking"
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire={`Concierge VIP Services & Travel Design`}
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  propHeight="129px"
                  marketingToolsPromotionInDire="Check-out Procedures"
                  propMargin="unset"
                  propFontWeight="unset"
                  group101="/group-101@2x.png"
                  afterThePositioning={false}
                  propWidth="820px"
                  propHeight1="unset"
                />
                <QuestionOpen
                  marketingToolsPromotionInDire={`Feedback Reporting, Analytics & Client Databases`}
                  group101="/group-101@2x.png"
                  afterThePositioning
                />
              </div>
            </div>
            <footer className={styles.footer}>
              <div className={styles.footer1}>
                <div className={styles.blue}>
                  <div className={styles.col}>
                    <div className={styles.popularLocations}>
                      Popular Locations
                    </div>
                    <div className={styles.locationLists}>
                      <div className={styles.mykonosBodrumIbizaContainer}>
                        <p className={styles.weAreHere}>{`Mykonos `}</p>
                        <p className={styles.weAreHere}>{`Bodrum `}</p>
                        <p className={styles.weAreHere}>{`Ibiza `}</p>
                        <p className={styles.weAreHere}>{`Antiparos `}</p>
                      </div>
                      <div className={styles.athensRivieraCreteContainer}>
                        <p className={styles.weAreHere}>{`Athens Riviera `}</p>
                        <p className={styles.weAreHere}>{`Crete `}</p>
                        <p className={styles.weAreHere}>{`Greek Islands `}</p>
                        <p className={styles.weAreHere}>{`Meganisi `}</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.col1}>
                    <div className={styles.luxuryVillasFor}>
                      Luxury Villas for Rent
                    </div>
                    <div className={styles.mykonosVillasBodrumVillasIWrapper}>
                      <div
                        className={styles.mykonosVillasBodrumVillasContainer}
                      >
                        <p className={styles.weAreHere}>
                          Mykonos Villas Bodrum Villas
                        </p>
                        <p className={styles.weAreHere}>Ibiza Villas</p>
                        <p className={styles.weAreHere}>Tulum Villas</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.col2}>
                    <div className={styles.popularServices}>
                      Popular Services
                    </div>
                    <div className={styles.chauffeurCarRentalYachtsPrParent}>
                      <div
                        className={styles.mykonosVillasBodrumVillasContainer}
                      >
                        <p className={styles.weAreHere}>Chauffeur</p>
                        <p className={styles.weAreHere}>Car Rental</p>
                        <p className={styles.weAreHere}>Yachts</p>
                        <p className={styles.weAreHere}>Private Chef</p>
                      </div>
                      <div
                        className={styles.mykonosVillasBodrumVillasContainer}
                      >
                        <p className={styles.weAreHere}>Private Security</p>
                        <p className={styles.weAreHere}>Kids Entertainment</p>
                        <p className={styles.weAreHere}>Helicopter Flights</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.col3}>
                    <div className={styles.luxuryVillasFor1}>
                      Luxury Villas for Sale
                    </div>
                    <div className={styles.mykonosVillasBodrumVillasIWrapper}>
                      <div
                        className={styles.mykonosVillasBodrumVillasContainer}
                      >
                        <p className={styles.weAreHere}>
                          Mykonos Villas Bodrum Villas
                        </p>
                        <p className={styles.weAreHere}>Ibiza Villas</p>
                        <p className={styles.weAreHere}>Tulum Villas</p>
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
                    <div className={styles.villas}>Travel Design</div>
                  </div>
                  <div className={styles.col5}>
                    <div className={styles.weManage}>We Manage</div>
                    <div className={styles.weManage}>About Us</div>
                    <div className={styles.weManage}>We are on the News</div>
                    <OpenNavbarContact contactPreset="PROPERTY_MANAGEMENT" className={styles.weManage}>
                      Contact Us
                    </OpenNavbarContact>
                    <div className={styles.weManage}>Sitemap</div>
                  </div>
                  <div className={styles.col6}>
                    <div className={styles.officeLocations}>
                      <div
                        className={styles.athensOffice}
                      >{`Athens Office `}</div>
                      <div className={styles.dimarchouAggelouMetaxaContainer}>
                        <p className={styles.weAreHere}>
                          Dimarchou Aggelou Metaxa 21 Glyfada, 166 75, Athens,
                        </p>
                        <p className={styles.weAreHere}>
                          Greece +30 22890 28233
                        </p>
                      </div>
                    </div>
                    <div className={styles.officeLocations1}>
                      <div
                        className={styles.athensOffice}
                      >{`Mykonos Office `}</div>
                      <div className={styles.argirena84600}>
                        Argirena, 846 00, Mykonos, Greece +30 22890 28233
                      </div>
                    </div>
                  </div>
                  <div className={styles.col7}>
                    <div className={styles.buttons1}>
                      <div className={styles.label1}>
                        Sign up form our newsletter
                      </div>
                      <img
                        className={styles.vectorIcon}
                        alt=""
                        src="/vector-71.svg"
                      />
                    </div>
                    <img
                      className={styles.logoIcon}
                      loading="lazy"
                      alt=""
                      src="/logo.svg"
                    />
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
                  <div className={styles.partnerLogos}>
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
                      src="/image-13@2x.png"
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
                      src="/image-16@2x.png"
                    />
                  </div>
                </div>
                <div className={styles.bottom}>
                  <div className={styles.kennedysGroupVacation}>
                    © 2026 Kennedys Group Vacation Rentals - Terms - Privacy
                  </div>
                </div>
                <div className={styles.whatsap}>
                  <img
                    className={styles.vuesaxlinearmessagesIcon}
                    loading="lazy"
                    alt=""
                    src="/vuesaxlinearmessages.svg"
                  />
                </div>
              </div>
            </footer>
          </div>
        </div>
    </div>
  );
};

export default ContactContent;
