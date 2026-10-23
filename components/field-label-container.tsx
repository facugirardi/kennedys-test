import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconChevron from "./icon-chevron"
import styles from "./field-label-container.module.css"

export type FieldLabelContainerType = {
  className?: string;
  ibiza?: string;
  iconChevron?: string;
  propWidth?: string;
  propHeight?: string;

  /** Style props */
  propMinWidth?: CSSProperties["minWidth"];
  propDisplay?: CSSProperties["display"];
  propMinWidth1?: CSSProperties["minWidth"];
};

const FieldLabelContainer: NextPage<FieldLabelContainerType> = ({
  className = "",
  propMinWidth,
  ibiza,
  propDisplay,
  propMinWidth1,
  iconChevron,
  propWidth,
  propHeight,
}) => {
  const fieldLabelContainerStyle: CSSProperties = useMemo(() => {
    return {
      minWidth: propMinWidth,
    };
  }, [propMinWidth]);

  const ibizaStyle: CSSProperties = useMemo(() => {
    return {
      display: propDisplay,
      minWidth: propMinWidth1,
    };
  }, [propDisplay, propMinWidth1]);

  return (
    <div
      className={[styles.fieldLabelContainer, className].join(" ")}
      style={fieldLabelContainerStyle}
    >
      <div className={styles.label}>
        <div className={styles.location}>Location</div>
      </div>
      <div className={styles.fieldText}>
        <div className={styles.container}>
          <div className={styles.ibiza} style={ibizaStyle}>
            {ibiza}
          </div>
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

export default FieldLabelContainer;
