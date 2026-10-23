import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./team-info.module.css"

export type TeamInfoType = {
  className?: string;
  premiumPortfolio?: string;
  ourPortfolioIncludesTopExclusiv?: string;
  image?: string;

  /** Style props */
  propTop?: CSSProperties["top"];
  propMinWidth?: CSSProperties["minWidth"];
  propWidth?: CSSProperties["width"];
};

const TeamInfo: NextPage<TeamInfoType> = ({
  className = "",
  propTop,
  propMinWidth,
  premiumPortfolio,
  ourPortfolioIncludesTopExclusiv,
  image,
  propWidth,
}) => {
  const teamInfoStyle: CSSProperties = useMemo(() => {
    return {
      top: propTop,
    };
  }, [propTop]);

  const frameDivStyle: CSSProperties = useMemo(() => {
    return {
      minWidth: propMinWidth,
    };
  }, [propMinWidth]);

  const imageIconStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  return (
    <section
      className={[styles.teamInfo, className].join(" ")}
      style={teamInfoStyle}
    >
      <div className={styles.premiumPortfolioParent} style={frameDivStyle}>
        <h1 className={styles.premiumPortfolio}>{premiumPortfolio}</h1>
        <div className={styles.ourPortfolioIncludes}>
          {ourPortfolioIncludesTopExclusiv}
        </div>
      </div>
      <img
        className={styles.imageIcon}
        loading="lazy"
        alt=""
        src={image}
        style={imageIconStyle}
      />
    </section>
  );
};

export default TeamInfo;
