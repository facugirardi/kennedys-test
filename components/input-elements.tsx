import type { NextPage } from "next";
import VuesaxlinearlocationIcon from "./vuesaxlinearlocation-icon"
import IconChevron from "./icon-chevron"
import styles from "./input-elements.module.css"

export type InputElementsType = {
  className?: string;
  vuesaxlinearlocation?: string;
  propWidth?: string;
  propHeight?: string;
};

const InputElements: NextPage<InputElementsType> = ({
  className = "",
  vuesaxlinearlocation,
  propWidth,
  propHeight,
}) => {
  return (
    <div className={[styles.inputElements, className].join(" ")}>
      <div className={styles.label}>
        <div className={styles.location}>Location</div>
        <VuesaxlinearlocationIcon vuesaxlinearlocation={vuesaxlinearlocation} />
      </div>
      <div className={styles.fieldText}>
        <img className={styles.leadingIcon} alt="" src="/leading-icon.svg" />
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
                className={styles.trailingIcon1}
                alt=""
                src="/trailingicon.svg"
              />
            </div>
            <div className={styles.div}>+2</div>
          </div>
        </div>
        <IconChevron
          iconChevron="/trailing-icon.svg"
          propWidth={propWidth}
          propHeight={propHeight}
        />
        <img className={styles.leadingIcon} alt="" src="/trailing-icon1.svg" />
      </div>
    </div>
  );
};

export default InputElements;
