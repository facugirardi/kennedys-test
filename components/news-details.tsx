import type { NextPage } from "next";
import styles from "./news-details.module.css"

export type NewsDetailsType = {
  className?: string;
  newsDetailBackground?: string;
  newsDetailIcon?: string;
};

const NewsDetails: NextPage<NewsDetailsType> = ({
  className = "",
  newsDetailBackground,
  newsDetailIcon,
}) => {
  return (
    <div className={[styles.newsDetails, className].join(" ")}>
      <div className={styles.newsDetailBackgroundParent}>
        <img
          className={styles.newsDetailBackground}
          loading="lazy"
          alt=""
          src={newsDetailBackground}
        />
        <div className={styles.heading}>
          <div className={styles.titleParent}>
            <div className={styles.title}>
              Holiday orgaised exactly according to you desires
            </div>
            <div className={styles.frameParent}>
              <div className={styles.newsDetailIconWrapper}>
                <img
                  className={styles.newsDetailIcon}
                  alt=""
                  src={newsDetailIcon}
                />
              </div>
              <div className={styles.groupChild} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
