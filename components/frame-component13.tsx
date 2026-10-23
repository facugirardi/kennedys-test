import type { NextPage } from "next";
import { useCallback } from "react";
import FieldLabels from "./field-labels"
import BedroomsAndBudget from "./bedrooms-and-budget"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import styles from "./frame-component13.module.css"

export type FrameComponent13Type = {
  className?: string;
};

const FrameComponent13: NextPage<FrameComponent13Type> = ({
  className = "",
}) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/concierge/list");
  }, [router]);

  const onSecondServiceButtonClick = useCallback(() => {
    router.push("/concierge/list");
  }, [router]);

  return (
    <section className={[styles.serviceOptionsWrapper, className].join(" ")}>
      <div className={styles.serviceOptions}>
        <div className={styles.destinationSelection}>
          <div className={styles.selectionFields}>
            <FieldLabels
              location1="Location"
              leadingIcon="/leading-icon1.svg"
              mykonos="Mykonos"
              leadingIcon1="/leadingicon.svg"
              trailingIcon="/trailingicon.svg"
              leadingIcon2="/leadingicon.svg"
              trailingIcon1="/trailingicon.svg"
              trailingIcon2="/trailing-icon2.svg"
              iconChevron="/icon--chevron.svg"
              propWidth1="24px"
              propHeight="24px"
            />
            <FieldLabels
              propFlex="unset"
              propMinWidth="unset"
              propWidth="204px"
              propAlignSelf="unset"
              location1="Type of Service"
              propDisplay="inline-block"
              propMinWidth1="89px"
              leadingIcon="/leading-icon1.svg"
              propFlex1="unset"
              mykonos="All"
              propPadding="unset"
              propAlignSelf1="stretch"
              leadingIcon1="/leadingicon.svg"
              trailingIcon="/trailingicon.svg"
              leadingIcon2="/leadingicon.svg"
              trailingIcon1="/trailingicon.svg"
              trailingIcon2="/trailing-icon2.svg"
              iconChevron="/icon--chevron.svg"
              propWidth1="24px"
              propHeight="24px"
            />
            {/* <BedroomsAndBudget
              propWidth="162px"
              budget="Price Range"
              propHeight="14px"
              propGap="-50px"
              trailingIcon="/trailing-icon-21.svg"
            /> */}
            <div className={styles.buttons} onClick={onButtonsContainerClick}>
              <div className={styles.label}> Filters</div>
              <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="/vuesaxlinearcandle2.svg" />
            </div>
            <button
              className={styles.secondServiceButton}
              onClick={onSecondServiceButtonClick}
            >
              <div className={styles.buttons1}>
                <div className={styles.label1}>Show Services</div>
                <img
                  className={styles.secondButtonIcon}
                  alt=""
                  src="/vector.svg"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent13;
