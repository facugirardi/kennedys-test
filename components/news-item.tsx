import type { NextPage } from "next";
import styles from "./news-item.module.css"

export type NewsItemType = {
  className?: string;
  newsBackground?: string;
  newsIconPair?: string;
};

const NewsItem: NextPage<NewsItemType> = ({
  className = "",
  newsBackground,
  newsIconPair,
}) => {
  return (
    <div className={[styles.newsItem, className].join(" ")}>
      <img
        className={styles.newsBackgroundIcon}
        loading="lazy"
        alt=""
        src={newsBackground}
      />
      <div className={styles.heading}>
        <div className={styles.newsTitles}>
          <div className={styles.title}>
            Holiday orgaised exactly according to you desires
          </div>
          <div className={styles.newsIcons}>
            <div className={styles.newsIconPairWrapper}>
              <img className={styles.newsIconPair} alt="" src={newsIconPair} />
            </div>
            <div className={styles.newsIconsChild} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsItem;
