import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./mykonian-tour.module.css"

export type MykonianTourType = {
  className?: string;
  mykonianTourContainer?: string;

  /** Action props */
  onImageWrapperContainerClick?: () => void;
};

const MykonianTour: NextPage<MykonianTourType> = ({
  className = "",
  mykonianTourContainer,
  onImageWrapperContainerClick,
}) => {
  const router = useRouter();

  const onMykonianTourContainerClick = useCallback(() => {
    router.push("/kennedys-villa-detail");
  }, [router]);

  return (
    <div className={[styles.mykonianTour, className].join(" ")}>
      <img
        className={styles.mykonianTourContainer}
        loading="lazy"
        alt=""
        src={mykonianTourContainer}
        onClick={onImageWrapperContainerClick}
      />
      <div className={styles.bottom}>
        <div className={styles.mykonianTourBottomWrapper}>
          <div
            className={styles.tourInMykonian}
          >{`Tour in Mykonian Land & Wine Tasting`}</div>
        </div>
      </div>
    </div>
  );
};

export default MykonianTour;
