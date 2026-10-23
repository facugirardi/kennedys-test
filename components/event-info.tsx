import type { NextPage } from "next";
import GroupComponent1 from "./group-component1"
import styles from "./event-info.module.css"

export type EventInfoType = {
  className?: string;
};

const EventInfo: NextPage<EventInfoType> = ({ className = "" }) => {
  return (
    <section className={[styles.eventInfo, className].join(" ")}>
      <div className={styles.otherEvents}>
        <div className={styles.otherEventsChild} />
      </div>
      <GroupComponent1
        partyImages="pending_755:6112"
        themedParties="Themed Parties"
        partyIcons="pending_755:6115"
        capa1="pending_755:6118"
      />
      <h1 className={styles.othersEvents}>Others Events</h1>
      <GroupComponent1
        propLeft="515px"
        propHeight="452.3px"
        partyImages="pending_755:6124"
        propHeight1="103.3px"
        themedParties="Mice and incentives"
        propHeight2="103.3px"
        partyIcons="pending_755:6127"
        capa1="pending_755:6130"
      />
      <GroupComponent1
        propLeft="948px"
        propHeight="431px"
        partyImages="pending_755:6135"
        propHeight1="75px"
        themedParties="Christenings"
        propHeight2="64px"
        partyIcons="pending_755:6138"
        capa1="pending_755:6141"
      />
      <a className={styles.viewAll}>{`View all `}</a>
    </section>
  );
};

export default EventInfo;
