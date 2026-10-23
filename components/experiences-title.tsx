import type { NextPage } from "next";
import { useCallback } from "react";
import { OpenNavbarContact } from "@/components/custom/OpenNavbarContact";
import { useRouter } from "next/router";
import Experience from "./experience"
import PersonalDance from "./personal-dance"
import MykonianTour from "./mykonian-tour"
import CatamaranCruise from "./catamaran-cruise"
import styles from "./experiences-title.module.css"

export type ExperiencesTitleType = {
  className?: string;
};

const ExperiencesTitle: NextPage<ExperiencesTitleType> = ({
  className = "",
}) => {
  const router = useRouter();

  const onImageWrapperContainerClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <>
      <section className={[styles.experiencesTitle, className].join(" ")}>
        <h1 className={styles.text}>Whats happening around</h1>
        <div className={styles.experiences}>
          <Experience
            onImageWrapperContainerClick={onImageWrapperContainerClick}
            image="/image-32@2x.png"
          />
          <PersonalDance
            personalDanceWrapper="/dance-lesson-icon@2x.png"
            onImageWrapperContainerClick={onImageWrapperContainerClick}
          />
          <MykonianTour
            mykonianTourContainer="/wine-tasting-details@2x.png"
            onImageWrapperContainerClick={onImageWrapperContainerClick}
          />
          <CatamaranCruise
            catamaranCruiseContainer="/catamaran-details@2x.png"
            onImageWrapperContainerClick={onImageWrapperContainerClick}
          />
          <OpenNavbarContact contactPreset="CONCIERGE" className={styles.buttons}>
            <div className={styles.label}>Contact Us</div>
            <img
              className={styles.experiencesButtonIcon}
              alt=""
              src="/vector.svg"
            />
          </OpenNavbarContact>
        </div>
      </section>
    </>
  );
};

export default ExperiencesTitle;
