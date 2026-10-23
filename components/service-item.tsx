import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./villa-item.module.css"

export type VillaItemType = {
  className?: string;
  villaImage?: string;
  title?: string;
  description?: string;
  country?: string;
  capa1?: string;
  price?: string;
  bedrooms?: number;
  guests?: number;
  pools?: number;

  /** Style props */
  propBorder?: CSSProperties["border"];
  propFlex?: CSSProperties["flex"];
  propMinWidth?: CSSProperties["minWidth"];
  propLeft?: CSSProperties["left"];
  propDisplay?: CSSProperties["display"];
  propMinWidth1?: CSSProperties["minWidth"];

  /** Action props */
  onCardContainerClick?: () => void;
};

const ServiceItem: NextPage<VillaItemType> = ({
  className = "",
  propBorder,
  onCardContainerClick,
  propFlex,
  propMinWidth,
  villaImage,
  propLeft,
  title,
  description,
  propDisplay,
  propMinWidth1,
}) => {
  const villaItemStyle: CSSProperties = useMemo(() => {
    return {
      border: propBorder,
      flex: propFlex,
      minWidth: propMinWidth,
    };
  }, [propBorder, propFlex, propMinWidth]);

  const heartIconsStyle: CSSProperties = useMemo(() => {
    return {
      left: propLeft,
    };
  }, [propLeft]);

  const titleStyle: CSSProperties = useMemo(() => {
    return {
      display: propDisplay,
      minWidth: propMinWidth1,
    };
  }, [propDisplay, propMinWidth1]);

  return (
    <div
      className={[styles.villaItem, className].join(" ")}
      style={villaItemStyle}
      onClick={onCardContainerClick}
    >
      <img className={styles.villaImageIcon} alt="" src={villaImage} />
      {/* <div className={styles.heartIcons} style={heartIconsStyle}>
        <img
          className={styles.vuesaxlinearheartIcon}
          loading="lazy"
          alt=""
          src="/vuesaxlinearheart.svg"
        />
      </div> */}
      <div className={styles.villaDetails}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.country}>{description}</div>
        <div style={{ textDecoration: 'underline' }} className={styles.title2}>View More</div>
        <div className={styles.bottomDetails}>

        </div>
      </div>
    </div>
  );
};

export default ServiceItem;
