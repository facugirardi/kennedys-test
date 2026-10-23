import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useRouter } from "next/router";
import FieldLabelContainer from "./field-label-container"
import FieldTypes from "./field-types"
import BedroomsAndBudget from "./bedrooms-and-budget"
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import styles from "./group-component6.module.css"

export type GroupComponent6Type = {
  className?: string;
};

const GroupComponent6: NextPage<GroupComponent6Type> = ({ className = "" }) => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const title = searchParams.get('type')

  const onConciergeTextClick = useCallback(() => {
    router.push("/concierge");
  }, [router]);

  const onMykonosTextClick = useCallback(() => {
    router.push("/concierge/list");
  }, [router]);

  const onButtonsContainerClick = useCallback(() => {
    router.push("/concierge/list");
  }, [router]);

  return (
    <section className={[styles.imageParent, className].join(" ")}>
      <img src="/rectangle-83@2x.png" className={styles.imageIcon} loading="lazy" alt="" />
      <h1 className={styles.chaufferInMykonos}>{title?.toUpperCase() || ''} Rental</h1>
      <div className={styles.content}>
        <div className={styles.locationFilter}>
          <div className={styles.locationInput}>
            <FieldLabelContainer
              propMinWidth="255px"
              ibiza="Mykonos"
              propDisplay="inline-block"
              propMinWidth1="63px"
              iconChevron="pending_755:5853"
              propWidth="24px"
              propHeight="24px"
            />
            <FieldTypes
              typeOfService="Type of Service"
              iconChevron="pending_755:5860"
              propWidth="24px"
              propHeight="24px"
            />
            {/* <BedroomsAndBudget
              propWidth="187px"
              budget="Price Range"
              propHeight="14px"
              propGap="-25px"
            /> */}
          </div>
          <div className={styles.buttons} onClick={onButtonsContainerClick}>
            <div className={styles.label}> Filters</div>
            <Vuesaxlinearcandle2Icon vuesaxlinearcandle2="pending_755:5870" />
          </div>
          <button className={styles.buttons1}>
            <a className={styles.label1}>Show 21 Services</a>
            <img className={styles.vectorIcon} alt="" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GroupComponent6;
