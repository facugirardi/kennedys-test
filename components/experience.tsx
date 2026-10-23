import type { NextPage } from "next";
import { useMemo, type CSSProperties, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./experience.module.css"

export type ExperienceType = {
  className?: string;
  image?: string;

  /** Style props */
  propTextDecoration?: CSSProperties["textDecoration"];

  /** Action props */
  onImageWrapperContainerClick?: () => void;
};

const Experience: NextPage<ExperienceType> = ({
  className = "",
  onImageWrapperContainerClick,
  image,
  propTextDecoration,
}) => {
  const flyingDressPhotoshootStyle: CSSProperties = useMemo(() => {
    return {
      textDecoration: propTextDecoration,
    };
  }, [propTextDecoration]);

  const router = useRouter();

  const onImageWrapperContainerClick1 = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <div className={[styles.experience, className].join(" ")}>
      <div
        className={styles.imageWrapper}
        onClick={onImageWrapperContainerClick}
      >
        <div className={styles.imageAndTitle}>
          <img className={styles.imageIcon} alt="" src={image} />
          <div className={styles.experienceTitleContainer}>
            <div className={styles.experienceTitleWrapper}>
              <a
                className={styles.flyingDressPhotoshoot}
                style={flyingDressPhotoshootStyle}
              >
                flying dress photoshoot
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
