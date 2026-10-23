import type { NextPage } from "next";
import { useState, useCallback } from "react";
import Contact from "./contact"
import PortalPopup from "./portal-popup"
import VillaItem from "./villa-item"
import styles from "./frame-component5.module.css"

export type FrameComponent5Type = {
  className?: string;
};

const FrameComponent5: NextPage<FrameComponent5Type> = ({ className = "" }) => {
  const [isContactOpen, setContactOpen] = useState(false);

  const openContact = useCallback(() => {
    setContactOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  return (
    <>
      <section className={[styles.similarVillasParent, className].join(" ")}>
        <h1 className={styles.similarVillas}>Similar VILLAS</h1>
        <div className={styles.villasGrid}>
          <div className={styles.vuesaxlineararchiveTick}>
            <img
              className={styles.vuesaxlineararchiveTickIcon}
              alt=""
              src="/vuesaxlineararchivetick.svg"
            />
          </div>
          <VillaItem
            propBorder="1px solid #a3a3a3"
            propFlex="1"
            propMinWidth="308px"
            villaImage="/villas-images@2x.png"
            propLeft="338px"
            title="Antonella"
            capa1="/capa-1-4@2x.png"
            propDisplay="unset"
            propMinWidth1="unset"
          />
          <VillaItem
            propBorder="1px solid #a3a3a3"
            propFlex="1"
            propMinWidth="308px"
            villaImage="/image8@2x.png"
            propLeft="337.7px"
            title="Mia"
            capa1="/capa-1-12@2x.png"
            propDisplay="unset"
            propMinWidth1="unset"
          />
          <VillaItem
            propBorder="1px solid #a3a3a3"
            propFlex="1"
            propMinWidth="308px"
            villaImage="/image-18@2x.png"
            propLeft="338.3px"
            title="Samantha"
            capa1="/capa-1-11@2x.png"
            propDisplay="unset"
            propMinWidth1="unset"
          />
        </div>
        <button className={styles.buttons} onClick={openContact}>
          <div className={styles.label}>View More Villas</div>
          <img className={styles.vectorIcon} alt="" src="/vector.svg" />
        </button>
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

export default FrameComponent5;
