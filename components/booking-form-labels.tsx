import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconChevron from "./icon-chevron"
import styles from "./booking-form-labels.module.css"

export type BookingFormLabelsType = {
  className?: string;
  location1?: string;
  mykonos?: string;
  iconChevron?: string;
  propWidth?: string;
  propHeight2?: string;

  /** Style props */
  propAlignSelf?: CSSProperties["alignSelf"];
  propHeight?: CSSProperties["height"];
  propFlex?: CSSProperties["flex"];
  propMinWidth?: CSSProperties["minWidth"];
  propHeight1?: CSSProperties["height"];
  propColor?: CSSProperties["color"];
};

const BookingFormLabels: NextPage<BookingFormLabelsType> = ({
  className = "",
  propAlignSelf,
  propHeight,
  propFlex,
  propMinWidth,
  location1,
  propHeight1,
  mykonos,
  propColor,
  iconChevron,
  propWidth,
  propHeight2,
}) => {
  const bookingFormLabelsStyle: CSSProperties = useMemo(() => {
    return {
      alignSelf: propAlignSelf,
      height: propHeight,
      flex: propFlex,
      minWidth: propMinWidth,
    };
  }, [propAlignSelf, propHeight, propFlex, propMinWidth]);

  const fieldText2Style: CSSProperties = useMemo(() => {
    return {
      height: propHeight1,
    };
  }, [propHeight1]);

  const mykonosStyle: CSSProperties = useMemo(() => {
    return {
      color: propColor,
    };
  }, [propColor]);

  return (
    <div
      className={[styles.bookingFormLabels, className].join(" ")}
      style={bookingFormLabelsStyle}
    >
      <div className={styles.label}>
        <div className={styles.location}>{location1}</div>
      </div>
      <div className={styles.fieldText} style={fieldText2Style}>
        <img className={styles.leadingIcon} alt="" src="/leading-icon1.svg" />
        <div className={styles.container}>
          <div className={styles.mykonos} style={mykonosStyle}>
            {mykonos}
          </div>
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
          iconChevron={iconChevron}
          propWidth={propWidth}
          propHeight={propHeight2}
        />
        <img className={styles.leadingIcon} alt="" src="/trailing-icon2.svg" />
      </div>
    </div>
  );
};

export default BookingFormLabels;
