import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconStar from "./icon-star"
import styles from "./testimonial-content.module.css"

export type TestimonialContentType = {
  className?: string;

  /** Style props */
  propLeft?: CSSProperties["left"];
  propRight?: CSSProperties["right"];
  propBackgroundColor?: CSSProperties["backgroundColor"];
  propLeft1?: CSSProperties["left"];
};

const TestimonialContent: NextPage<TestimonialContentType> = ({
  className = "",
  propLeft,
  propRight,
  propBackgroundColor,
  propLeft1,
}) => {
  const testimonialContentStyle: CSSProperties = useMemo(() => {
    return {
      left: propLeft,
      right: propRight,
      backgroundColor: propBackgroundColor,
    };
  }, [propLeft, propRight, propBackgroundColor]);

  const testimonialTwoContentStyle: CSSProperties = useMemo(() => {
    return {
      left: propLeft1,
    };
  }, [propLeft1]);

  return (
    <div
      className={[styles.testimonialContent, className].join(" ")}
      style={testimonialContentStyle}
    >
      <div
        className={styles.testimonialTwoContent}
        style={testimonialTwoContentStyle}
      >
        <div className={styles.testimonialTwoAuthor}>
          <h2 className={styles.title}>
            <p className={styles.loremIpsumDolor}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
              quis mauris eros sollicitudin facilisis Vestibulum ante tortor,
              aliquam dapibus justo at, aliq lacinia leo.
            </p>
            <p className={styles.vestibulumElitOne}>vestibulum elit one. </p>
          </h2>
          <div className={styles.testimonialTwoAuthor1}>
            <img className={styles.imageIcon} alt="" src="/image-2@2x.png" />
            <div className={styles.title1}>David Brayden</div>
            <div className={styles.title2}>Occupation</div>
          </div>
          <div className={styles.testimonialRating}>
            <IconStar iconStar="/icon--star.svg" />
            <IconStar iconStar="/icon--star-1.svg" />
            <IconStar iconStar="/icon--star-2.svg" />
            <IconStar iconStar="/icon--star-3.svg" />
            <IconStar iconStar="/icon--star-4.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialContent;
