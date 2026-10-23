import type { NextPage } from "next";
import { useCallback } from "react";
import BookingFormLabels from "./booking-form-labels"
import InputElements1 from "./input-elements1"
import IconUpDown from "./icon-up-down"
import InputLabelPairs from "./input-label-pairs"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import styles from "./frame-component12.module.css"

export type FrameComponent12Type = {
  className?: string;
};

const FrameComponent12: NextPage<FrameComponent12Type> = ({
  className = "",
}) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <div className={[styles.kennedysVillasListInner, className].join(" ")}>
      <div className={styles.frameWrapper}>
        <div className={styles.frameContainer}>
          <div className={styles.frameParent}>
            <BookingFormLabels
              propAlignSelf="unset"
              propHeight="unset"
              propFlex="1"
              propMinWidth="281px"
              location1="Destination"
              propHeight1="44px"
              mykonos="Ibiza"
              propColor="#172338"
              iconChevron="/trailing-icon-1.svg"
              propWidth="24px"
              propHeight2="24px"
            />
            <InputElements1
              propHeight="44px"
              propWidth="24px"
              propHeight1="24px"
            />
            <div className={styles.labelParent}>
              <div className={styles.label}>
                <div className={styles.bedrooms}>Bedrooms</div>
              </div>
              <div className={styles.fieldText}>
                <div className={styles.container}>
                  <div className={styles.empty}>1</div>
                  <IconUpDown trailingIcon="/trailing-icon-2.svg" />
                </div>
              </div>
            </div>
            <InputLabelPairs propWidth="24px" propHeight="24px" />
            <div className={styles.buttonsParent}>
              <button className={styles.buttons}>
                <div className={styles.label1}>Check availability</div>
                <img
                  className={styles.buttonIconList}
                  alt=""
                  src="/vector-1.svg"
                />
              </button>
              <div
                className={styles.buttons1}
                onClick={onButtonsContainerClick}
              >
                <div className={styles.label2}> Filters</div>
                <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="/vuesaxlinearcandle2.svg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameComponent12;
