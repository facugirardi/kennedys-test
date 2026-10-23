import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./checkbox.module.css"

export type CheckboxType = {
  className?: string;
  iconCheck?: string;
  label?: string;

  /** Style props */
  propWidth?: CSSProperties["width"];
  propHeight?: CSSProperties["height"];
  propAlignSelf?: CSSProperties["alignSelf"];
  propWidth1?: CSSProperties["width"];
  propDisplay?: CSSProperties["display"];
  propAlignItems?: CSSProperties["alignItems"];
  propFlex?: CSSProperties["flex"];
};

const Checkbox: NextPage<CheckboxType> = ({
  className = "",
  propWidth,
  propHeight,
  propAlignSelf,
  iconCheck,
  label,
  propWidth1,
  propDisplay,
  propAlignItems,
  propFlex,
}) => {
  const checkboxStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
      height: propHeight,
      alignSelf: propAlignSelf,
    };
  }, [propWidth, propHeight, propAlignSelf]);

  const iconCheckStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth1,
      display: propDisplay,
      alignItems: propAlignItems,
      flex: propFlex,
    };
  }, [propWidth1, propDisplay, propAlignItems, propFlex]);

  return (
    <div
      className={[styles.checkbox, className].join(" ")}
      style={checkboxStyle}
    >
      <div className={styles.container}>
        <div className={styles.check}>
          <img className={styles.iconCheck} alt="" src={iconCheck} />
        </div>
        <div className={styles.label} >
          {label}
        </div>
      </div>
    </div>
  );
};

export default Checkbox;
