import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./personal-dance.module.css"

export type PersonalDanceType = {
  className?: string;
  personalDanceWrapper?: string;

  /** Action props */
  onImageWrapperContainerClick?: () => void;
};

const PersonalDance: NextPage<PersonalDanceType> = ({
  className = "",
  personalDanceWrapper,
  onImageWrapperContainerClick,
}) => {
  const router = useRouter();

  const onPersonalDanceWrapperClick = useCallback(() => {
    router.push("/villas-details");
  }, [router]);

  return (
    <div className={[styles.personalDance, className].join(" ")}>
      <div className={styles.personalDanceContainer}>
        <img
          className={styles.personalDanceWrapper}
          loading="lazy"
          alt=""
          src={personalDanceWrapper}
          onClick={onImageWrapperContainerClick}
        />
        <div className={styles.bottom}>
          <div className={styles.personalDanceBottomWrapper}>
            <div className={styles.personalDanceLessonsContainer}>
              <p className={styles.personal}>{`personal `}</p>
              <p className={styles.personal}>DAnce lessons</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDance;
