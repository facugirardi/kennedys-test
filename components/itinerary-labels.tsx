import type { NextPage } from "next";
import { useMemo, type CSSProperties, type MouseEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/router";
import styles from "./itinerary-labels.module.css"

export type ItineraryLabelsType = {
  className?: string;
  group50?: string;
  group54?: string;
  group49?: string;
  group55?: string;

  /** Style props */
  propWidth?: CSSProperties["width"];

  /** Action props */
  onServiceListContainerClick?: () => void;
};

const ItineraryLabels: NextPage<ItineraryLabelsType> = ({
  className = "",
  onServiceListContainerClick,
  group50,
  group54,
  group49,
  group55,
  propWidth,
}) => {
  const yatchRentalStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  const router = useRouter();

  const navigateToType = (type: string) => {
    router.push(`/concierge/list?type=${encodeURIComponent(type)}`);
  };

  const buildInteractiveHandlers = (type: string) => ({
    role: "button" as const,
    tabIndex: 0,
    onClick: (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      navigateToType(type);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        navigateToType(type);
      }
    },
  });

  return (
    <div
      className={[styles.itineraryLabels, className].join(" ")}
      onClick={onServiceListContainerClick}
    >
      <img
        className={styles.itineraryLabelsChild}
        loading="lazy"
        alt=""
        src={group50}
        {...buildInteractiveHandlers("personalized itineraries")}
      />
      <img
        className={styles.itineraryLabelsItem}
        loading="lazy"
        alt=""
        src={group54}
        {...buildInteractiveHandlers("jet rental")}
      />
      <img
        className={styles.itineraryLabelsInner}
        alt=""
        src={group49}
        {...buildInteractiveHandlers("yacht rental")}
      />
      <img
        className={styles.groupIcon}
        loading="lazy"
        alt=""
        src={group55}
        {...buildInteractiveHandlers("helicopter")}
      />
      <div
        className={styles.personalizedItineraries}
        {...buildInteractiveHandlers("personalized itineraries")}
      >{`Personalized itineraries `}</div>
      <div className={styles.helicopter} {...buildInteractiveHandlers("helicopter")}>Helicopter</div>
      <div className={styles.jetRental} {...buildInteractiveHandlers("jet rental")}>Jet Rental</div>
      <div
        className={styles.yatchRental}
        style={yatchRentalStyle}
        {...buildInteractiveHandlers("yacht rental")}
      >
        <p className={styles.yatch}>Yatch</p>
        <p className={styles.yatch}>Rental</p>
      </div>
    </div>
  );
};

export default ItineraryLabels;
