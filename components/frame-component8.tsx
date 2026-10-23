import type { NextPage } from "next";
import { useCallback } from "react";
import FieldLabelContainer from "./field-label-container"
import FieldLabelContainer1 from "./field-label-container1"
import IconUpDown from "./icon-up-down"
import InputElements2 from "./input-elements2"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import styles from "./frame-component8.module.css"

export type FrameComponent8Type = {
  className?: string;
};

const FrameComponent8: NextPage<FrameComponent8Type> = ({ className = "" }) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <section className={[styles.frameParent, className].join(" ")}>
      <div className={styles.searchWrapper}>
        <div className={styles.search}>Search</div>
      </div>
      <div className={styles.searchFilterBar}>
        <div className={styles.searchFields}>
          <FieldLabelContainer
            ibiza="Ibiza"
            iconChevron="/trailing-icon4.svg"
            propWidth="24px"
            propHeight="24px"
          />
          <FieldLabelContainer1
            type="Type"
            iconChevron="/trailing-icon4.svg"
            propWidth="24px"
            propHeight="24px"
          />
          <div className={styles.fieldLabelContainer}>
            <div className={styles.label}>
              <div className={styles.bedrooms}>Bedrooms</div>
            </div>
            <div className={styles.fieldText}>
              <div className={styles.container}>
                <div className={styles.div}>1</div>
                <IconUpDown trailingIcon="/trailing-icon-21.svg" />
              </div>
            </div>
          </div>
          <InputElements2
            propHeight="14px"
            trailingIcon="/trailing-icon-21.svg"
          />
        </div>
        <div className={styles.buttons} onClick={onButtonsContainerClick}>
          <div className={styles.label1}> Filters</div>
          <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="/vuesaxlinearcandle2.svg" />
        </div>
        <button className={styles.buttons1}>
          <div className={styles.label2}>Check Now</div>
          <img className={styles.vectorIcon} alt="" src="/vector.svg" />
        </button>
      </div>
    </section>
  );
};

export default FrameComponent8;
