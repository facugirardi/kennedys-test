import type { NextPage } from "next";
import IconStar from "./icon-star"
import TestimonialContent from "./testimonial-content"
import styles from "./group-component4.module.css"

export type GroupComponent4Type = {
  className?: string;
};

const GroupComponent4: NextPage<GroupComponent4Type> = ({ className = "" }) => {
  return (
    <section className={[styles.groupParent, className].join(" ")}>
      {/* <img className={styles.groupChild} alt="" src="/group-42.svg" /> */}
      {/* <img className={styles.maskGroupIcon} alt="" /> */}
      <div className={styles.slider}>
        <div className={styles.navigationDots} />
        <div className={styles.sliderItems} />
        <div className={styles.sliderItems} />
        <div className={styles.sliderItems} />
        <div className={styles.sliderItems} />
      </div>
      <div className={styles.testimonialsTitle}>
        <h1 className={styles.whatPeopleSays}>What people says about us</h1>
        <div className={styles.testimonialOne}>
          <div className={styles.testimonialOneContent}>
            <h2 className={styles.title}>
              <p className={styles.loremIpsumDolor}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                quis mauris eros sollicitudin facilisis Vestibulum ante tortor,
                aliquam dapibus justo at, aliq lacinia leo.
              </p>
              <p className={styles.vestibulumElitOne}>vestibulum elit one. </p>
            </h2>
            <div className={styles.testimonialOneAuthor}>
              <img
                className={styles.imageIcon}
                loading="lazy"
                alt=""
                src="/image-2@2x.png"
              />
              <div className={styles.title1}>David Brayden</div>
              <div className={styles.title2}>Occupation</div>
            </div>
            <div className={styles.reviewRating}>
              <IconStar iconStar="/icon--star.svg" />
              <IconStar iconStar="/icon--star-1.svg" />
              <IconStar iconStar="/icon--star-2.svg" />
              <IconStar iconStar="/icon--star-3.svg" />
              <IconStar iconStar="/icon--star-4.svg" />
            </div>
          </div>
        </div>
        {/* <TestimonialContent /> */}
      </div>
      {/* <TestimonialContent
        propLeft="unset"
        propRight="2px"
        propBackgroundColor="#fff"
        propLeft1="0px"
      /> */}
      <div className={styles.groupItem} />
      <div className={styles.testimonialBackgroundShape} />
    </section>
  );
};

export default GroupComponent4;
