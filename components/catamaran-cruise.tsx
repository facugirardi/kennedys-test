import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./catamaran-cruise.module.css"

export type CatamaranCruiseType = {
  className?: string;
  catamaranCruiseContainer?: string;

  /** Action props */
  onImageWrapperContainerClick?: () => void;
};

const CatamaranCruise: NextPage<CatamaranCruiseType> = ({
  className = "",
  catamaranCruiseContainer,
  onImageWrapperContainerClick,
}) => {
  const router = useRouter();

  const onCatamaranCruiseContainerClick = useCallback(() => {
    router.push("/villas-details");
  }, [router]);

  return (
    <div className={[styles.catamaranCruise, className].join(" ")}>
      <img
        className={styles.catamaranCruiseContainer}
        loading="lazy"
        alt=""
        src={catamaranCruiseContainer}
        onClick={onImageWrapperContainerClick}
      />
      <div className={styles.bottom}>
        <div className={styles.catamaranCruiseBottomWrappe}>
          <div className={styles.fiveHourCruiseIn}>
            Five-Hour Cruise in Luxury Catamaran
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatamaranCruise;
