import type { NextPage } from "next";
import IconClose from "./icon-close"
import styles from "./tag.module.css"

export type TagType = {
  className?: string;
  showNumber?: string;
  showTrailingIcon?: boolean;
  showLeadingIcon?: boolean;
  labelPlaceholder?: string;
};

const Tag: NextPage<TagType> = ({
  className = "",
  showNumber = "(3)",
  showTrailingIcon = true,
  showLeadingIcon = false,
  labelPlaceholder,
}) => {
  return (
    <div className={[styles.tag, className].join(" ")}>
      {showLeadingIcon && (
        <img className={styles.leadingIcon} alt="" src="/leadingicon9.svg" />
      )}
      <input
        className={styles.label}
        placeholder={labelPlaceholder}
        type="text"
      />
      <div className={styles.number}>{showNumber}</div>
      {showTrailingIcon && <IconClose />}
    </div>
  );
};

export default Tag;
