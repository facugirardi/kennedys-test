import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconChevron from "./icon-chevron"
import styles from "./input-elements1.module.css"

export type InputElements1Type = {
  className?: string;
  propWidth?: string;
  propHeight1?: string;

  /** Style props */
  propHeight?: CSSProperties["height"];
};

const InputElements1: NextPage<InputElements1Type> = ({
  className = "",
  propHeight,
  propWidth,
  propHeight1,
}) => {
  const fieldTextStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight,
    };
  }, [propHeight]);

  return (
    <div className={[styles.inputElements, className].join(" ")}>
      <div className={styles.label}>
        <div className={styles.checkIn}>Check In / Check Out</div>
      </div>
      <div className={styles.fieldText} style={fieldTextStyle}>
        <img className={styles.leadingIcon} alt="" src="/leading-icon1.svg" />
        <div className={styles.container}>
          <div className={styles.chips}>
            <div className={styles.chip}>
              <img
                className={styles.leadingIcon1}
                alt=""
                src="/leadingicon.svg"
              />
              <div className={styles.label1}>{`Chip `}</div>
              <b className={styles.number}>213</b>
              <input className={styles.trailingIcon} type="checkbox" />
            </div>
            <div className={styles.chip}>
              <img
                className={styles.leadingIcon1}
                alt=""
                src="/leadingicon.svg"
              />
              <div className={styles.label1}>Chip</div>
              <b className={styles.number}>213</b>
              <input className={styles.trailingIcon} type="checkbox" />
            </div>
            <div className={styles.div}>+2</div>
          </div>
        </div>
        <IconChevron
          iconChevron="/trailing-icon-1.svg"
          propWidth={propWidth}
          propHeight={propHeight1}
        />
        <img className={styles.leadingIcon} alt="" src="/trailing-icon2.svg" />
      </div>
    </div>
  );
};

export default InputElements1;
