import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import styles from "./services-card.module.css"

export type ServicesCardType = {
  className?: string;
  rectangle39?: string;
  title?: string;
  ourConciergeServices?: boolean;
  vuesaxlinearheart?: string;
  propHeight?: string;
  propWidth1?: string;

  /** Style props */
  propAlignSelf?: CSSProperties["alignSelf"];
  propFlex?: CSSProperties["flex"];
  propWidth?: CSSProperties["width"];
  propAlignSelf1?: CSSProperties["alignSelf"];
};

const ServicesCard: NextPage<ServicesCardType> = ({
  className = "",
  propAlignSelf,
  rectangle39,
  title,
  ourConciergeServices,
  propFlex,
  propWidth,
  propAlignSelf1,
  vuesaxlinearheart,
  propHeight,
  propWidth1,
}) => {
  const servicesCardStyle: CSSProperties = useMemo(() => {
    return {
      alignSelf: propAlignSelf,
    };
  }, [propAlignSelf]);

  const ourConciergeServicesStyle: CSSProperties = useMemo(() => {
    return {
      flex: propFlex,
      width: propWidth,
      alignSelf: propAlignSelf1,
    };
  }, [propFlex, propWidth, propAlignSelf1]);

  return (
    <div
      className={[styles.servicesCard, className].join(" ")}
      style={servicesCardStyle}
    >
      <img className={styles.servicesCardChild} alt="" src={rectangle39} />
      <div className={styles.vuesaxlinearheartWrapper}>
        <VuesaxlinearheartIcon1
          vuesaxlinearheart={vuesaxlinearheart}
          propHeight={propHeight}
          propWidth={propWidth1}
        />
      </div>
      <div className={styles.title}>{title}</div>
      {!ourConciergeServices && (
        <div
          className={styles.ourConciergeServices}
          style={ourConciergeServicesStyle}
        >{`Our concierge services offer unparalleled luxury and personalized attention. `}</div>
      )}
      <div className={styles.viewMore}>View More</div>
    </div>
  );
};

export default ServicesCard;
