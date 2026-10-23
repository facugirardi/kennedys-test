import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconCalendar from "./icon-calendar"
import styles from "./frame-component.module.css"

export type FrameComponentType = {
  className?: string;
  checkIn?: string;
  trailingIcon2?: string;
  trailingIcon3?: boolean;
  showTrailingIcon?: boolean;
  iconCalendar?: string;
  propWidth1?: string;

  /** Style props */
  propFlex?: CSSProperties["flex"];
  propWidth?: CSSProperties["width"];
  propAlignSelf?: CSSProperties["alignSelf"];
};

const FrameComponent: NextPage<FrameComponentType> = ({
  className = "",
  propFlex,
  propWidth,
  propAlignSelf,
  checkIn,
  trailingIcon2,
  trailingIcon3,
  showTrailingIcon,
  iconCalendar,
  propWidth1,
}) => {
  const frameDiv1Style: CSSProperties = useMemo(() => {
    return {
      flex: propFlex,
      width: propWidth,
    };
  }, [propFlex, propWidth]);

  const label1Style: CSSProperties = useMemo(() => {
    return {
      alignSelf: propAlignSelf,
    };
  }, [propAlignSelf]);

  return (
    <div
      className={[styles.labelParent, className].join(" ")}
      style={frameDiv1Style}
    >
      <div className={styles.label} style={label1Style}>
        <div className={styles.checkIn}>{checkIn}</div>
      </div>
      <div className={styles.fieldText}>
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
              <img
                className={styles.trailingIcon}
                alt=""
                src="/trailingicon.svg"
              />
            </div>
            <div className={styles.chip}>
              <img
                className={styles.leadingIcon1}
                alt=""
                src="/leadingicon.svg"
              />
              <div className={styles.label1}>Chip</div>
              <b className={styles.number}>213</b>
              <img
                className={styles.trailingIcon}
                alt=""
                src="/trailingicon.svg"
              />
            </div>
            <div className={styles.div}>+2</div>
          </div>
        </div>
        {!trailingIcon3 && (
          <img className={styles.leadingIcon} alt="" src={trailingIcon2} />
        )}
        {showTrailingIcon && (
          <IconCalendar iconCalendar={iconCalendar} propWidth={propWidth1} />
        )}
      </div>
    </div>
  );
};

export default FrameComponent;
