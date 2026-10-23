import type { NextPage } from "next";
import { useMemo, type CSSProperties, useCallback } from "react";
import { useRouter } from "next/router";
import VuesaxlineararrowRightIcon from "./vuesaxlineararrow-right-icon"
import styles from "./card1.module.css"

export type Card1Type = {
  className?: string;
  image?: string;
  title?: string;

  /** Style props */
  propGap?: CSSProperties["gap"];

  /** Action props */
  onCardContainerClick?: () => void;
};

const Card1: NextPage<Card1Type> = ({
  className = "",
  onCardContainerClick,
  image,
  propGap,
  title,
}) => {
  const bottomStyle: CSSProperties = useMemo(() => {
    return {
      gap: propGap,
    };
  }, [propGap]);

  const router = useRouter();

  const onCardContainerClick1 = useCallback(() => {
    router.push("/real-estate");
  }, [router]);

  return (
    <div
      className={[styles.card, className].join(" ")}
      onClick={onCardContainerClick}
    >
      <img className={styles.imageIcon} loading="lazy" alt="" src={image} />
      <div className={styles.bottom} style={bottomStyle}>
        <div className={styles.left}>
          <div className={styles.title}>{title}</div>
        </div>
        <VuesaxlineararrowRightIcon />
      </div>
    </div>
  );
};

export default Card1;
