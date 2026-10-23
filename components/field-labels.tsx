import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconChevron from "./icon-chevron"
import styles from "./field-labels.module.css"

export type FieldLabelsType = {
  className?: string;
  location1?: string;
  leadingIcon?: string;
  mykonos?: string;
  leadingIcon1?: string;
  trailingIcon?: string;
  leadingIcon2?: string;
  trailingIcon1?: string;
  trailingIcon2?: string;
  iconChevron?: string;
  propWidth1?: string;
  propHeight?: string;

  /** Style props */
  propFlex?: CSSProperties["flex"];
  propMinWidth?: CSSProperties["minWidth"];
  propWidth?: CSSProperties["width"];
  propAlignSelf?: CSSProperties["alignSelf"];
  propDisplay?: CSSProperties["display"];
  propMinWidth1?: CSSProperties["minWidth"];
  propFlex1?: CSSProperties["flex"];
  propPadding?: CSSProperties["padding"];
  propAlignSelf1?: CSSProperties["alignSelf"];
};

const FieldLabels: NextPage<FieldLabelsType> = ({
  className = "",
  propFlex,
  propMinWidth,
  propWidth,
  propAlignSelf,
  location1,
  propDisplay,
  propMinWidth1,
  leadingIcon,
  propFlex1,
  mykonos,
  propPadding,
  propAlignSelf1,
  leadingIcon1,
  trailingIcon,
  leadingIcon2,
  trailingIcon1,
  trailingIcon2,
  iconChevron,
  propWidth1,
  propHeight,
}) => {
  const fieldLabelsStyle: CSSProperties = useMemo(() => {
    return {
      flex: propFlex,
      minWidth: propMinWidth,
      width: propWidth,
    };
  }, [propFlex, propMinWidth, propWidth]);

  const labelStyle: CSSProperties = useMemo(() => {
    return {
      alignSelf: propAlignSelf,
    };
  }, [propAlignSelf]);

  const locationStyle: CSSProperties = useMemo(() => {
    return {
      display: propDisplay,
      minWidth: propMinWidth1,
    };
  }, [propDisplay, propMinWidth1]);

  const container3Style: CSSProperties = useMemo(() => {
    return {
      flex: propFlex1,
    };
  }, [propFlex1]);

  const chipsStyle: CSSProperties = useMemo(() => {
    return {
      padding: propPadding,
      alignSelf: propAlignSelf1,
    };
  }, [propPadding, propAlignSelf1]);

  return (
    <div
      className={[styles.fieldLabels, className].join(" ")}
      style={fieldLabelsStyle}
    >
      <div className={styles.label} style={labelStyle}>
        <div className={styles.location} style={locationStyle}>
          {location1}
        </div>
      </div>
      <div className={styles.fieldText}>
        <img className={styles.leadingIcon} alt="" src={leadingIcon} />
        <div className={styles.container} style={container3Style}>
          <div className={styles.mykonos}>{mykonos}</div>
          <div className={styles.chips} style={chipsStyle}>
            <div className={styles.chip}>
              <img className={styles.leadingIcon1} alt="" src={leadingIcon1} />
              <div className={styles.label1}>{`Chip `}</div>
              <b className={styles.number}>213</b>
              <img className={styles.trailingIcon} alt="" src={trailingIcon} />
            </div>
            <div className={styles.chip}>
              <img className={styles.leadingIcon1} alt="" src={leadingIcon2} />
              <div className={styles.label1}>Chip</div>
              <b className={styles.number}>213</b>
              <img
                className={styles.trailingIcon1}
                alt=""
                src={trailingIcon1}
              />
            </div>
            <div className={styles.div}>+2</div>
          </div>
        </div>
        <IconChevron
          iconChevron={iconChevron}
          propWidth={propWidth1}
          propHeight={propHeight}
        />
        <img className={styles.leadingIcon} alt="" src={trailingIcon2} />
      </div>
    </div>
  );
};

export default FieldLabels;
