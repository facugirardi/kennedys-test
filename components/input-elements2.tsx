import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconUpDown from "./icon-up-down"
import styles from "./input-elements2.module.css"

export type InputElements2Type = {
  className?: string;
  trailingIcon?: string;

  /** Style props */
  propHeight?: CSSProperties["height"];
};

const InputElements2: NextPage<InputElements2Type> = ({
  className = "",
  propHeight,
  trailingIcon,
}) => {
  const container2Style: CSSProperties = useMemo(() => {
    return {
      height: propHeight,
    };
  }, [propHeight]);

  return (
    <div className={[styles.inputElements, className].join(" ")}>
      <div className={styles.label}>
        <div className={styles.budget}>Budget</div>
      </div>
      <div className={styles.fieldText}>
        <div className={styles.container} style={container2Style}>
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

export default InputElements2;
