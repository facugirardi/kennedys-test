import type { NextPage } from "next";
import IconChevron from "./icon-chevron"
import styles from "./input-label-pairs.module.css"

export type InputLabelPairsType = {
  className?: string;
  propWidth?: string;
  propHeight?: string;
};

const InputLabelPairs: NextPage<InputLabelPairsType> = ({
  className = "",
  propWidth,
  propHeight,
}) => {
  return (
    <div className={[styles.inputLabelPairs, className].join(" ")}>
      <div className={styles.label}>
        <div className={styles.budget}>Budget</div>
      </div>
      <div className={styles.fieldText}>
        <div className={styles.container}>
          <div className={styles.div}>$1000-$5000</div>
        </div>
        <IconChevron
          iconChevron="/trailing-icon-1.svg"
          propWidth={propWidth}
          propHeight={propHeight}
        />
      </div>
    </div>
  );
};

export default InputLabelPairs;
