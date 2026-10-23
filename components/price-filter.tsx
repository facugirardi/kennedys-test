import type { NextPage } from "next";
import styles from "./price-filter.module.css"

export type PriceFilterType = {
  className?: string;
};

const PriceFilter: NextPage<PriceFilterType> = ({ className = "" }) => {
  return (
    <div className={[styles.priceFilter, className].join(" ")}>
      <div className={styles.priceRange}>Price Range</div>
      <img className={styles.priceFilterChild} alt="" />
      <div className={styles.priceRange1}>
        <div className={styles.fieldText}>
          <img className={styles.leadingIcon} alt="" />
          <div className={styles.container}>
            <div className={styles.priceRangeSeparator}>$</div>
            <input className={styles.noMin} placeholder="No Min$" type="text" />
            <div className={styles.chips}>
              <div className={styles.chip}>
                <img className={styles.leadingIcon1} alt="" />
                <div className={styles.label}>{`Chip `}</div>
                <b className={styles.number}>213</b>
                <img className={styles.trailingIcon} alt="" />
              </div>
              <div className={styles.chip}>
                <img className={styles.leadingIcon1} alt="" />
                <div className={styles.label}>Chip</div>
                <b className={styles.number}>213</b>
                <img className={styles.trailingIcon} alt="" />
              </div>
              <div className={styles.div}>+2</div>
            </div>
          </div>
          <img className={styles.leadingIcon} alt="" />
        </div>
        <div className={styles.fieldText}>
          <img className={styles.leadingIcon} alt="" />
          <div className={styles.container}>
            <div className={styles.priceRangeSeparator}>$</div>
            <input className={styles.noMin} placeholder="No Max$" type="text" />
            <div className={styles.chips}>
              <div className={styles.chip}>
                <img className={styles.leadingIcon1} alt="" />
                <div className={styles.label}>{`Chip `}</div>
                <b className={styles.number}>213</b>
                <img className={styles.trailingIcon} alt="" />
              </div>
              <div className={styles.chip}>
                <img className={styles.leadingIcon1} alt="" />
                <div className={styles.label}>Chip</div>
                <b className={styles.number}>213</b>
                <img className={styles.trailingIcon} alt="" />
              </div>
              <div className={styles.div}>+2</div>
            </div>
          </div>
          <img className={styles.leadingIcon} alt="" />
        </div>
      </div>
    </div>
  );
};

export default PriceFilter;
