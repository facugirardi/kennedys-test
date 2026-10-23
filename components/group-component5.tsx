import type { NextPage } from "next";
import { useState, useCallback } from "react";
import Contact from "./contact"
import PortalPopup from "./portal-popup"
import { useRouter } from "next/router";
import ItineraryLabels from "./itinerary-labels"
import styles from "./group-component5.module.css"

export type GroupComponent5Type = {
  className?: string;
};

const GroupComponent5: NextPage<GroupComponent5Type> = ({ className = "" }) => {
  const [isContactOpen, setContactOpen] = useState(false);
  const router = useRouter();

  const openContact = useCallback(() => {
    setContactOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  const onServiceListContainerClick = useCallback(() => {
    router.push("/concierge");
  }, [router]);

  return (
    <>
      <section
        className={[styles.exploreServicesButtonContaiWrapper, className].join(
          " "
        )}
      >
        <div className={styles.exploreServicesButtonContai}>
          <button className={styles.buttons} onClick={openContact}>
            <div className={styles.label}>Contact Now</div>
            <img className={styles.vectorIcon} alt="" src="/vector.svg" />
          </button>
          <img
            className={styles.unionIcon}
            loading="lazy"
            alt=""
            src="/union1.svg"
          />
          <div className={styles.servicesHeader}>
            <h1 className={styles.ourGlobalServices}>Our global services</h1>
          </div>
          <div className={styles.servicesVisualsContainer}>
            <div className={styles.servicesIcons}>
              <div className={styles.frameParent}>
                <div className={styles.vectorWrapper}>
                  <img
                    className={styles.vectorIcon1}
                    alt=""
                    src="/vector.svg"
                  />
                </div>
                <div className={styles.groupChild} />
              </div>
              <img
                className={styles.servicesIconsChild}
                loading="lazy"
                alt=""
                src="/group-86-1@2x.png"
              />
            </div>
            <ItineraryLabels
              onServiceListContainerClick={onServiceListContainerClick}
              group50="/group-50@2x.png"
              group54="/group-54@2x.png"
              group49="/group-49@2x.png"
              group55="/group-55@2x.png"
              propWidth="92px"
            />
          </div>
        </div>
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

export default GroupComponent5;
