import type { NextPage } from "next";
import { useCallback } from "react";
import FieldLabelContainer1 from "./field-label-container1"
import BedroomsAndBudget from "./bedrooms-and-budget"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import styles from "./form.module.css"

export type FormType = {
  className?: string;
};

const Form: NextPage<FormType> = ({ className = "" }) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <section className={[styles.form, className].join(" ")}>
      <div className={styles.formFields}>
        <div className={styles.inputFields}>
          <FieldLabelContainer1
            propMinWidth="261px"
            type="Location"
            propJustifyContent="space-between"
            propGap="0px"
            propRowGap="20px"
          />
          <FieldLabelContainer1
            propMinWidth="261px"
            type="Type of Service"
            propJustifyContent="flex-end"
            propGap="unset"
            propRowGap="unset"
            iconChevron="pending_755:5963"
            propWidth="24px"
            propHeight="24px"
          />
          {/* <BedroomsAndBudget
            propWidth="187px"
            budget="Price Range"
            propHeight="14px"
            propGap="-25px"
            trailingIcon="pending_755:5970"
          /> */}
        </div>
        <div className={styles.buttons} onClick={onButtonsContainerClick}>
          <div className={styles.label}>
            <span className={styles.filters}> Filters</span>
            <span className={styles.span}>{` `}</span>
          </div>
          <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="pending_755:5973" />
        </div>
        <button className={styles.buttons1}>
          <div className={styles.label1}>Show Services</div>
          <img className={styles.vectorIcon} alt="" />
        </button>
      </div>
    </section>
  );
};

export default Form;
