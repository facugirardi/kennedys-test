import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconChevron from "./icon-chevron"
import styles from "./field-label-container1.module.css"

export type FieldLabelContainer1Type = {
  className?: string;
  type?: string;
  iconChevron?: string;
  propWidth?: string;
  propHeight?: string;

  /** Style props */
  propMinWidth?: CSSProperties["minWidth"];
  propJustifyContent?: CSSProperties["justifyContent"];
  propGap?: CSSProperties["gap"];
  propRowGap?: CSSProperties["rowGap"];
};

const FieldLabelContainer1: NextPage<FieldLabelContainer1Type> = ({
  className = "",
  propMinWidth,
  type,
  propJustifyContent,
  propGap,
  propRowGap,
  iconChevron,
  propWidth,
  propHeight,
}) => {
  const fieldLabelContainer1Style: CSSProperties = useMemo(() => {
    return {
      minWidth: propMinWidth,
    };
  }, [propMinWidth]);

  const container1Style: CSSProperties = useMemo(() => {
    return {
      justifyContent: propJustifyContent,
      gap: propGap,
      rowGap: propRowGap,
    };
  }, [propJustifyContent, propGap, propRowGap]);

  return (
    <div
      className={[styles.fieldLabelContainer, className].join(" ")}
      style={fieldLabelContainer1Style}
    >
      <div className={styles.label}>
        <div className={styles.type}>{type}</div>
      </div>
      <div className={styles.fieldText}>
        <div className={styles.container} style={container1Style}>
          <IconChevron
            iconChevron={iconChevron}
            propWidth={propWidth}
            propHeight={propHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default FieldLabelContainer1;
