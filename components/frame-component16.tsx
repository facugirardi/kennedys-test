import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./frame-component16.module.css"

export type FrameComponent16Type = {
  className?: string;
};

const FrameComponent16: NextPage<FrameComponent16Type> = ({
  className = "",
}) => {
  const router = useRouter();

  const onTheresNoOneSizeFitsAllClick = useCallback(() => {
    router.push("/events-detail");
  }, [router]);

  return (
    <section className={[styles.eventTypeColumnsParent, className].join(" ")}>
      <div className={styles.eventTypeColumns}>
        <img className={styles.eventTypeColumnsChild} loading="lazy" alt="" />
        <div className={styles.firstEventTypeContent}>
          <div
            className={styles.theresNoOneSizeFitsAllContainer}
            onClick={onTheresNoOneSizeFitsAllClick}
          >
            <p className={styles.theresNoOneSizeFitsAll}>
              There's no one-size-fits-all for a 'perfect wedding'. From
              fairy-tale romantic to boho chic, the options are endless. It's
              all about what works best for the couple and their guests.
            </p>
            <p className={styles.theresNoOneSizeFitsAll}>&nbsp;</p>
            <p className={styles.moreInfo}>More info</p>
          </div>
        </div>
        <h1 className={styles.wedding}>WEDDING</h1>
        <img className={styles.contentIcon} alt="" />
      </div>
      <div className={styles.corporateEventImage}>
        <img className={styles.miceImagePlaceholder} alt="" />
        <img className={styles.miceIcon} alt="" />
        <div className={styles.corporateEventContent}>
          <div
            className={styles.theresNoOneSizeFitsAllContainer}
            onClick={onTheresNoOneSizeFitsAllClick}
          >
            <p className={styles.theresNoOneSizeFitsAll}>
              Elevate Your Corporate Experience with Mice and Incentives. Reward
              your team, inspire productivity, and create lasting memories with
              our tailored programs. From conferences to team-building retreats,
              we offer personalized solutions to meet your unique needs.
            </p>
            <p className={styles.theresNoOneSizeFitsAll}>&nbsp;</p>
            <p className={styles.moreInfo}>More info</p>
          </div>
        </div>
        <h1 className={styles.miceAndIncentivesContainer}>
          <p className={styles.mice}>MICE</p>
          <p className={styles.mice}>AND INCENTIVES</p>
        </h1>
        <img className={styles.contentIcon1} alt="" />
      </div>
      <div className={styles.eventTypeColumns1}>
        <img className={styles.eventTypeColumnsChild} loading="lazy" alt="" />
        <div className={styles.firstEventTypeContent}>
          <div
            className={styles.theresNoOneSizeFitsAllContainer}
            onClick={onTheresNoOneSizeFitsAllClick}
          >
            <p className={styles.theresNoOneSizeFitsAll}>
              Is it time to celebrate your little one's arrival? Let's make
              their christening unforgettable together! We have countless ideas
              and themes to create a joyous event for you and your loved ones.
            </p>
            <p className={styles.theresNoOneSizeFitsAll}>&nbsp;</p>
            <p className={styles.moreInfo}>More info</p>
          </div>
        </div>
        <div className={styles.eventTypeColumnsItem} />
        <h1 className={styles.christenings}>CHRISTENINGS</h1>
        <img className={styles.contentIcon} loading="lazy" alt="" />
      </div>
      <div className={styles.themedPartyImage}>
        <img className={styles.miceImagePlaceholder} loading="lazy" alt="" />
        <img className={styles.themesIcon} loading="lazy" alt="" />
        <div className={styles.themedPartyContent}>
          <div
            className={styles.theresNoOneSizeFitsAllContainer}
            onClick={onTheresNoOneSizeFitsAllClick}
          >
            <p className={styles.theresNoOneSizeFitsAll}>
              Turn Your Party into an Unforgettable Theme Experience
            </p>
            <p className={styles.theresNoOneSizeFitsAll}>
              Inject excitement and creativity into your event with our theme
              parties! Whether you're hosting a birthday bash, anniversary
              celebration, or corporate event, our themed parties add a unique
              touch that guests will remember. From elegant masquerades to
              vibrant tropical luaus, we offer a wide range of themes to suit
              any occasion. Let us bring your vision to life and create a party
              experience that's truly unforgettable!
            </p>
            <p className={styles.theresNoOneSizeFitsAll}>&nbsp;</p>
            <p className={styles.moreInfo}>More info</p>
          </div>
        </div>
        <h1 className={styles.themesParty}>THEMES PARTY</h1>
      </div>
    </section>
  );
};

export default FrameComponent16;
