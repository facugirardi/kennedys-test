import type { NextPage } from "next";
import { useCallback } from "react";
import InputElements from "./input-elements"
import InputElements1 from "./input-elements1"
import InputElements2 from "./input-elements2"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import CallToAction from "./call-to-action"
import styles from "./search-input.module.css"

export type SearchInputType = {
  className?: string;
};

const SearchInput: NextPage<SearchInputType> = ({ className = "" }) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <section className={[styles.searchInput, className].join(" ")}>
      <div className={styles.searchTitle}>
        <h1 className={styles.luxuryVacationRentals}>
          Luxury Vacation Rentals
        </h1>
      </div>
      <div className={styles.searchFilters}>
        <div className={styles.searchInputContainer}>
          <div className={styles.searchInputs}>
            <InputElements
              vuesaxlinearlocation="pending_380:3871"
              propWidth="24px"
              propHeight="24px"
            />
            <InputElements1 propWidth="24px" propHeight1="24px" />
            <div className={styles.inputElements}>
              <div className={styles.label}>
                <div className={styles.bedrooms}>Bedrooms</div>
              </div>
              <div className={styles.fieldText}>
                <div className={styles.container}>
                  <div className={styles.emptyContainer}>1</div>
                  <img
                    className={styles.trailingIcon}
                    loading="lazy"
                    alt=""
                    src="/trailing-icon-2.svg"
                  />
                </div>
              </div>
            </div>
            <InputElements2 trailingIcon="/trailing-icon-2.svg" />
            <div className={styles.buttons} onClick={onButtonsContainerClick}>
              <div className={styles.label1}> Filters</div>
              <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="/vuesaxlinearcandle2.svg" />
            </div>
          </div>
          <div className={styles.fieldText1}>
            <img
              className={styles.leadingIcon}
              alt=""
              src="/leading-icon1.svg"
            />
            <img
              className={styles.vuesaxlinearsmsIcon}
              alt=""
              src="/vuesaxlinearsms.svg"
            />
            <div className={styles.container1}>
              <div className={styles.emptyContainer}>Email</div>
              <div className={styles.chips}>
                <div className={styles.chip}>
                  <img
                    className={styles.leadingIcon1}
                    alt=""
                    src="/leadingicon.svg"
                  />
                  <div className={styles.label2}>{`Chip `}</div>
                  <b className={styles.number}>213</b>
                  <img
                    className={styles.trailingIcon1}
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
                  <div className={styles.label2}>Chip</div>
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
            <img
              className={styles.leadingIcon}
              alt=""
              src="/trailing-icon2.svg"
            />
          </div>
        </div>
        <CallToAction />
      </div>
    </section>
  );
};

export default SearchInput;
