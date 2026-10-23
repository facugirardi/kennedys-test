import type { NextPage } from "next";
import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import VillasLayout from "./villas-layout"
import styles from "./similar-villas-header.module.css"

export type SimilarVillasHeaderType = {
  className?: string;
};

const SimilarVillasHeader: NextPage<SimilarVillasHeaderType> = ({
  className = "",
}) => {
  const [isContactOpen, setContactOpen] = useState(false);
  const router = useRouter();
  const AllVillas = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  const closeContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  return (
    <>
      <section className={[styles.similarVillasHeader, className].join(" ")}>
        <h1 className={styles.similarVillas}>Similar VILLAS</h1>
        <div className={styles.villasContainer}>
          <div className={styles.vuesaxlineararchiveTick}>
            <img
              className={styles.vuesaxlineararchiveTickIcon}
              alt=""
              src="/vuesaxlineararchivetick.svg"
            />
          </div>
          <VillasLayout
            villasImages="/villas-images@2x.png"
            title="Antonella"
            capa1="/capa-1-4@2x.png"
            propHeight="18px"
            propWidth="18px"
          />
          <VillasLayout
            villasImages="/image8@2x.png"
            title="Mia"
            capa1="/capa-1-12@2x.png"
            propHeight="18px"
            propWidth="18px"
          />
          <VillasLayout
            villasImages="/image-18@2x.png"
            title="Samantha"
            capa1="/capa-1-11@2x.png"
            propHeight="18px"
            propWidth="18px"
          />
        </div>
        <button className={styles.buttons} onClick={AllVillas}>
          <div className={styles.label}>View More Villas</div>
          <img className={styles.vectorIcon} alt="" src="/vector.svg" />
        </button>
      </section>

    </>
  );
};

export default SimilarVillasHeader;
