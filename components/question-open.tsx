import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./question-open.module.css"

export type QuestionOpenType = {
  className?: string;
  marketingToolsPromotionInDire?: string;
  group101?: string;
  afterThePositioning?: boolean;

  /** Style props */
  propHeight?: CSSProperties["height"];
  propMargin?: CSSProperties["margin"];
  propFontWeight?: CSSProperties["fontWeight"];
  propWidth?: CSSProperties["width"];
  propHeight1?: CSSProperties["height"];
};

const QuestionOpen: NextPage<QuestionOpenType> = ({
  className = "",
  propHeight,
  marketingToolsPromotionInDire,
  propMargin,
  propFontWeight,
  group101,
  afterThePositioning,
  propWidth,
  propHeight1,
}) => {
  const questionOpenStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight,
    };
  }, [propHeight]);

  const marketingToolsStyle: CSSProperties = useMemo(() => {
    return {
      margin: propMargin,
      fontWeight: propFontWeight,
    };
  }, [propMargin, propFontWeight]);

  const afterThePositioningStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
      height: propHeight1,
    };
  }, [propWidth, propHeight1]);

  return (
    <div
      className={[styles.questionOpen, className].join(" ")}
      style={questionOpenStyle}
    >
      <div className={styles.top}>
        <div className={styles.marketingTools} style={marketingToolsStyle}>
          {marketingToolsPromotionInDire}
        </div>
        <img className={styles.topChild} alt="" src={group101} />
      </div>
      {!afterThePositioning && (
        <div
          className={styles.afterThePositioning}
          style={afterThePositioningStyle}
        >
          After the positioning of and pricelist finalisation for the property,
          we proceed with its online and offline promotion and its targeted
          listing in the correct channels. ​Our marketing actions, always in
          accordance with the owner’s preferences, can include website
          creation, listing of the property in our vast partners network,
          promotion of the property through Google Ads, newsletter campaigns,
          social media channels, travelling sites, magazine coverage etc​. 
        </div>
      )}
    </div>
  );
};

export default QuestionOpen;
