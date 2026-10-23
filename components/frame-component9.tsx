import type { NextPage } from "next";
import styles from "./frame-component9.module.css"

export type FrameComponent9Type = {
  className?: string;
};

const FrameComponent9: NextPage<FrameComponent9Type> = ({ className = "" }) => {
  return (
    <section className={[styles.eventStyleElementsParent, className].join(" ")}>
      <div className={styles.eventStyleElements}>
        <div className={styles.elegance}>Elegance</div>
        <div className={styles.everyEventReflects}>
          Every event reflects refinement and style, creating memorable
          experiences with elegance.
        </div>
      </div>
      <img
        className={styles.eventsValuesList}
        alt=""
        src="/events-values-list.svg"
      />
      <div className={styles.eventStyleElements}>
        <div className={styles.personalization}>Personalization</div>
        <div className={styles.weFocusOn}>
          We focus on tailoring every aspect of your event to match your
          preferences, ensuring a unique and personalized occasion.
        </div>
      </div>
      <img
        className={styles.eventsValuesList}
        alt=""
        src="/events-values-list1.svg"
      />
      <div className={styles.eventStyleElements}>
        <div className={styles.attentionToDetail}>Attention to Detail</div>
        <div className={styles.ourAttentionTo}>
          Our attention to detail extends from venue selection to logistics,
          ensuring flawless execution and surpassing expectations.
        </div>
      </div>
    </section>
  );
};

export default FrameComponent9;
