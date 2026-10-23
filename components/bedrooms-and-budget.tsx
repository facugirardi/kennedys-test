import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconUpDown from "./icon-up-down"
import styles from "./bedrooms-and-budget.module.css"

export type BedroomsAndBudgetType = {
  className?: string;
  budget?: string;
  trailingIcon?: string;

  /** Style props */
  propWidth?: CSSProperties["width"];
  propHeight?: CSSProperties["height"];
  propGap?: CSSProperties["gap"];
};

const BedroomsAndBudget: NextPage<BedroomsAndBudgetType> = ({
  className = "",
  propWidth,
  budget,
  propHeight,
  propGap,
  trailingIcon,
}) => {
  const bedroomsAndBudgetStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  const containerStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight,
      gap: propGap,
    };
  }, [propHeight, propGap]);

  return (
    <div
      className={[styles.bedroomsAndBudget, className].join(" ")}
      style={bedroomsAndBudgetStyle}
    >
      <div className={styles.label}>
        <div className={styles.budget}>{budget}</div>
      </div>
      <div className={styles.fieldText}>
        <div className={styles.container} style={containerStyle}>
          <input
            className={styles.input}
            placeholder="$1000-$5000"
            type="text"
          />
          <IconUpDown trailingIcon={trailingIcon} />
        </div>
      </div>
    </div>
  );
};

export default BedroomsAndBudget;
