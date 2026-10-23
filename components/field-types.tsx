import type { NextPage } from "next";
import IconChevron from "./icon-chevron"
import styles from "./field-types.module.css"

export type FieldTypesType = {
  className?: string;
  typeOfService?: string;
  iconChevron?: string;
  propWidth?: string;
  propHeight?: string;
};

const FieldTypes: NextPage<FieldTypesType> = ({
  className = "",
  typeOfService,
  iconChevron,
  propWidth,
  propHeight,
}) => {
  return (
    <div className={[styles.fieldTypes, className].join(" ")}>
      <div className={styles.label}>
        <div className={styles.typeOfService}>{typeOfService}</div>
      </div>
      <div className={styles.fieldText}>
        <a className={styles.all}>All</a>
        <div className={styles.container}>
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

export default FieldTypes;
