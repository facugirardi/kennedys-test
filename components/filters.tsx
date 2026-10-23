import type { NextPage } from "next";
import { useCallback } from "react";
import FieldLabels from "./field-labels"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import styles from "./filters.module.css"

export type FiltersType = {
  className?: string;
};

const Filters: NextPage<FiltersType> = ({ className = "" }) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/concierge/list");
  }, [router]);

  return (
    <div className={[styles.filters, className].join(" ")}>
      <div className={styles.filterContainer}>
        <div className={styles.filterContent}>
          <div className={styles.destinationDropdown}>
            <FieldLabels
              propFlex="unset"
              propMinWidth="unset"
              propWidth="326px"
              propAlignSelf="unset"
              location1="Choose a destination"
              propDisplay="unset"
              propMinWidth1="unset"
              leadingIcon="pending_594:4994"
              propFlex1="unset"
              trailingIcon2="pending_594:5000"
              iconChevron="pending_594:5323"
              propWidth1="24px"
              propHeight="24px"
            />
            <FieldLabels
              propFlex="1"
              propMinWidth="unset"
              propWidth="unset"
              propAlignSelf="stretch"
              location1="Type of Service"
              propDisplay="unset"
              propMinWidth1="unset"
              leadingIcon="pending_639:6547"
              propFlex1="1"
              mykonos="All"
              propPadding="0px 19px 0px 0px"
              propAlignSelf1="unset"
              leadingIcon1="pending_I639:6551;60:559"
              trailingIcon="pending_I639:6551;1770:24514"
              leadingIcon2="pending_I639:6552;60:559"
              trailingIcon1="pending_I639:6552;1770:24514"
              trailingIcon2="pending_639:6555"
              iconChevron="pending_639:6554"
              propWidth1="24px"
              propHeight="24px"
            />
            <div className={styles.buttons} onClick={onButtonsContainerClick}>
              <div className={styles.label}>
                <span className={styles.filters1}>{` Filters `}</span>
                <span className={styles.span}>(1)</span>
              </div>
              <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="pending_634:5147" />
            </div>
            <button className={styles.filterDivider}>
              <div className={styles.buttons1}>
                <a className={styles.label1}>Show 21 Services</a>
                <img className={styles.filterDividerIcon} alt="" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
