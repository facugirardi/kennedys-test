import type { NextPage } from "next";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import styles from "./frame-component7.module.css"

export type FrameComponent7Type = {
  className?: string;
};

const FrameComponent7: NextPage<FrameComponent7Type> = ({ className = "" }) => {
  return (
    <section className={[styles.meetOurTeamParent, className].join(" ")}>
        <h1 className={styles.meetOurTeam}>MEET OUR TEAM</h1>
        <div className={styles.teamContent}>
          <div className={styles.teamInfo}>
            <OpenNavbarContact className={styles.buttons}>
              <div className={styles.label}>Contact Us</div>
              <img className={styles.vectorIcon} alt="" src="/vector.svg" />
            </OpenNavbarContact>
            <div className={styles.teamMember}>
              <img
                className={styles.memberPhotoIcon}
                loading="lazy"
                alt=""
                src="/rectangle-832@2x.png"
              />
              <div className={styles.title}>
                <h1 className={styles.name}>WHAT WE OFFER</h1>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.aToZContainer}>
                <ul className={styles.aToZPropertyConsultancyC}>
                  <li className={styles.aToZ}>A to Z Property Consultancy </li>
                  <li
                    className={styles.aToZ}
                  >{`Correct Positioning & High Competency on Market ​ `}</li>
                  <li
                    className={styles.aToZ}
                  >{`Professional Rate Analysis & Pricelist Suggestions​ `}</li>
                  <li
                    className={styles.aToZ}
                  >{`Property Promotion in Direct & Third-party Channels ​ `}</li>
                  <li
                    className={styles.aToZ}
                  >{`Sophisticated Marketing Tools & Campaigns ​`}</li>
                  <li
                    className={styles.aToZ}
                  >{`Property Care & Supervision `}</li>
                  <li>{`Property Photo-shooting & Digital Branding ​ `}</li>
                </ul>
              </div>
              <div className={styles.reservationsManagementContainer}>
                <ul className={styles.aToZPropertyConsultancyC}>
                  <li
                    className={styles.aToZ}
                  >{`Reservations Management & Booking Calendar Handling​ `}</li>
                  <li
                    className={styles.aToZ}
                  >{`Legal Documents, Contract & Paperwork Handling (Guest-Owner)  `}</li>
                  <li className={styles.aToZ}>
                    Property Inspection prior to Check-in ​ 
                  </li>
                  <li
                    className={styles.aToZ}
                  >{`Detailed Report & Logistics Handling ​ `}</li>
                  <li
                    className={styles.aToZ}
                  >{`Villa Staff Recruiting & Briefing (on guest arrival, preferences, and special needs)​ `}</li>
                  <li>{`Villa Set Up​ & Property Pre-stocking  `}</li>
                </ul>
              </div>
              <div className={styles.guestsMeetContainer}>
                <ul className={styles.aToZPropertyConsultancyC}>
                  <li
                    className={styles.aToZ}
                  >{`Guests’ Meet & Greet at the Airport & Transfer to Property  ​ `}</li>
                  <li
                    className={styles.aToZ}
                  >{`Guests’ Check-in & Villa Tour  `}</li>
                  <li className={styles.aToZ}>
                    Top Housekeeping Management ​ 
                  </li>
                  <li className={styles.aToZ}>On-the-spot Live Support ​ </li>
                  <li
                    className={styles.aToZ}
                  >{`Check-out Handling & Damage Report Services ​ `}</li>
                  <li className={styles.aToZ}>
                    High-profile Concierge Services​ 
                  </li>
                  <li>{`VIP Lifestyle & Experience Design​  `}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default FrameComponent7;
