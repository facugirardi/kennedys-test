import type { NextPage } from "next";
import { useCallback } from "react";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import { useRouter } from "next/router";
import Experience from "./experience"
import PersonalDance from "./personal-dance"
import MykonianTour from "./mykonian-tour"
import CatamaranCruise from "./catamaran-cruise"
import styles from "./experiences.module.css"

export type ExperiencesType = {
  className?: string;
};

const Experiences: NextPage<ExperiencesType> = ({ className = "" }) => {
  const router = useRouter();

  const onExperienceItemContainerClick = useCallback(() => {
    // router.push("/kennedys-villa-detail1");
  }, [router]);

  return (
    <>
      <section className={[styles.experiences, className].join(" ")}>
        <h1 className={styles.experienceTitle}>Whats happening around</h1>
        <div className={styles.experiencesContainer}>
          <Experience
            onImageWrapperContainerClick={onExperienceItemContainerClick}
            image="/image-32@2x.png"
            propTextDecoration="none"
          />
          <PersonalDance
            personalDanceWrapper="/dance-lesson-icon@2x.png"
            onImageWrapperContainerClick={onExperienceItemContainerClick}
          />
          <MykonianTour
            mykonianTourContainer="/wine-tasting-details@2x.png"
            onImageWrapperContainerClick={onExperienceItemContainerClick}
          />
          <CatamaranCruise
            catamaranCruiseContainer="/catamaran-details@2x.png"
            onImageWrapperContainerClick={onExperienceItemContainerClick}
          />
          <OpenNavbarContact contactPreset="CONCIERGE" className={styles.buttons}>
            <div className={styles.label}>Contact Us</div>
            <img
              className={styles.experienceButtonIcon}
              alt=""
              src="/vector.svg"
            />
          </OpenNavbarContact>
        </div>
      </section>
    </>
  );
};

export default Experiences;
