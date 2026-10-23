import type { NextPage } from "next";
import { useCallback } from "react";
import BookingFormLabels from "./booking-form-labels"
import IconChevron from "./icon-chevron"
import InputLabelPairs from "./input-label-pairs"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import styles from "./filter-wrapper.module.css"

export type FilterWrapperType = {
  className?: string;
};

const FilterWrapper: NextPage<FilterWrapperType> = ({ className = "" }) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/villas-list");
  }, [router]);

  return (
    <section className={[styles.filterWrapper, className].join(" ")}>
      <div className={styles.filterFields}>
        <div className={styles.filterInputs}>
          <div className={styles.inputFields}>
            <BookingFormLabels
              propAlignSelf="unset"
              propHeight="unset"
              propFlex="1"
              propMinWidth="281px"
              location1="Location"
              propHeight1="44px"
              mykonos="Ibiza"
              propColor="#172338"
              iconChevron="/trailing-icon-1.svg"
              propWidth="24px"
              propHeight2="24px"
            />
            <div className={styles.dateFilter}>
              <input
                className={styles.label}
                placeholder="Check In / Check Out"
                type="text"
              />
              <div className={styles.fieldText}>
                <img
                  className={styles.leadingIcon}
                  alt=""
                  src="/leading-icon1.svg"
                />
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
                <IconChevron
                  iconChevron="/trailing-icon-1.svg"
                  propWidth="24px"
                  propHeight="24px"
                />
                <img
                  className={styles.leadingIcon}
                  alt=""
                  src="/trailing-icon2.svg"
                />
              </div>
            </div>
            <div className={styles.inputLabelPairs}>
              <div className={styles.label3}>
                <div className={styles.bedrooms}>Bedrooms</div>
              </div>
              <div className={styles.fieldText1}>
                <div className={styles.container1}>
                  <div className={styles.placeholder}>1</div>
                  <img
                    className={styles.trailingIcon3}
                    loading="lazy"
                    alt=""
                    src="/trailing-icon-2.svg"
                  />
                </div>
              </div>
            </div>
            <InputLabelPairs propWidth="24px" propHeight="24px" />
            <div className={styles.searchButton}>
              <button className={styles.buttons}>
                <div className={styles.label4}>Check availability</div>
                <img className={styles.searchIcon} alt="" src="/vector-1.svg" />
              </button>
              <div
                className={styles.buttons1}
                onClick={onButtonsContainerClick}
              >
                <div className={styles.label5}> Filters</div>
                <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="/vuesaxlinearcandle2.svg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterWrapper;
