import type { NextPage } from "next";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import VuesaxlinearmessagesIcon from "./vuesaxlinearmessages-icon"
import styles from "./footer1.module.css"

export type Footer1Type = {
  className?: string;
};

const Footer1: NextPage<Footer1Type> = ({ className = "" }) => {
  return (
    <div className={[styles.fullyes, className].join(" ")}>
      <div className={styles.blossom}>
        <div className={styles.blossomBackground} />
        <h1 className={styles.organizeYourTripContainer}>
          <p className={styles.organize}>ORGANIZE YOUR</p>
          <p className={styles.tripWith}>TRIP with my</p>
          <p
            className={styles.tripWith}
          >{`                          blossom `}</p>
        </h1>
        <div className={styles.buttons}>
          <div className={styles.label}>Start Your Journey</div>
          <img className={styles.vectorIcon} alt="" src="/vector.svg" />
        </div>
        <div className={styles.fromItineraryPlanning}>
          From itinerary planning to accommodations and beyond, trust us to
          handle all the intricacies of your journey seamlessly.
        </div>
        <img className={styles.blossomChild} alt="" src="/group-25@2x.png" />
        <img
          className={styles.blossomGraphicIcon}
          alt=""
          src="/blossom-graphic.svg"
        />
        <img className={styles.capa1Icon} alt="" src="/capa-1-1.svg" />
        <img
          className={styles.blossomBottomBackground}
          alt=""
          src="/blossom-bottom-background@2x.png"
        />
      </div>
      <div className={styles.footer}>
        <div className={styles.groupParent}>
          <div className={styles.fullOfficeLocationsParent}>
            <div className={styles.fullOfficeLocations} />
            <footer className={styles.fullOfficeLocations1} />
            <div className={styles.fullNavigationLinks}>
              <div className={styles.menu}>
                <div className={styles.villas}>Villas</div>
                <div className={styles.concierge}>Concierge</div>
                <div className={styles.villas}>Events</div>
                <div className={styles.realEstate}>Real Estate</div>
              </div>
            </div>
            <div className={styles.menu1}>
              <div className={styles.aboutUs}>About Us</div>
              <div className={styles.aboutUs}>Our story</div>
              <div className={styles.careers}>Careers</div>
              <OpenNavbarContact className={styles.contactUs}>
                Contact Us
              </OpenNavbarContact>
            </div>
            <div className={styles.dimarchouAggelouMetaxaContainer}>
              <p className={styles.dimarchouAggelouMetaxa}>
                Dimarchou Aggelou Metaxa 21 Glyfada, 166 75, Athens,
              </p>
              <p className={styles.dimarchouAggelouMetaxa}>
                Greece +30 22890 28233
              </p>
            </div>
            <div className={styles.athensOffice}>{`Athens Office `}</div>
            <div className={styles.kennedysGroupVacation}>
              © 2026 Kennedys Group Vacation Rentals - Terms - Privacy
            </div>
            <div className={styles.buttons1}>
              <div className={styles.label1}>Sign up form our newsletter</div>
              <img className={styles.vectorIcon} alt="" src="/vector2.svg" />
            </div>
            <img className={styles.capa1Icon1} alt="" src="/logo.svg" />
            <div className={styles.mykonosOffice}>{`Mykonos Office `}</div>
            <div className={styles.argirena84600}>
              Argirena, 846 00, Mykonos, Greece +30 22890 28233
            </div>
          </div>
          <div className={styles.fullYesWhatsapp}>
            <VuesaxlinearmessagesIcon vuesaxlinearmessages="/vuesaxlinearmessages.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer1;
