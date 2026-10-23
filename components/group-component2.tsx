import type { NextPage } from "next";
import { useCallback } from "react";
import { useRouter } from "next/router";
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import VuesaxlinearstarIcon from "./vuesaxlinearstar-icon"
import styles from "./group-component2.module.css"

export type GroupComponent2Type = {
  className?: string;
};

const GroupComponent2: NextPage<GroupComponent2Type> = ({ className = "" }) => {
  const router = useRouter();

  const onRectangleImageClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <section className={[styles.rectangleParent, className].join(" ")}>
      <img
        className={styles.groupChild}
        alt=""
        src="/rectangle-77@2x.png"
        onClick={onRectangleImageClick}
      />
      <div className={styles.vuesaxlinearheartWrapper}>
        <VuesaxlinearheartIcon1 vuesaxlinearheart="/vuesaxlinearheart.svg" />
      </div>
      {/* World's top 12 badge - commented out, can be re-enabled if needed */}
      {/* <button className={styles.vuesaxlinearstarParent}>
        <VuesaxlinearstarIcon />
        <div className={styles.worldsTop12}>World's top 12</div>
      </button> */}
      <h1 className={styles.trendingNow}>Trending now</h1>
      <div className={styles.groupParent}>
        <div className={styles.frameParent}>
          <div className={styles.vectorWrapper}>
            <img className={styles.vectorIcon} alt="" src="/vector6.svg" />
          </div>
          <div className={styles.groupItem} />
        </div>
        <img
          className={styles.groupInner}
          loading="lazy"
          alt=""
          src="/group-861@2x.png"
        />
      </div>
      <div className={styles.groupWrapper}>
        <div className={styles.frameWrapper}>
          <div className={styles.frameWrapper}>
            <div className={styles.parent}>
              <div className={styles.div}>€12,000.00</div>
              <div className={styles.night}>/NIGHT</div>
            </div>
            <div className={styles.from}>FROM</div>
          </div>
        </div>
      </div>
      <div className={styles.frameContainer}>
        <div className={styles.groupContainer}>
          <div className={styles.groupDiv} onClick={onRectangleImageClick}>
            <div className={styles.rectangleGroup}>
              <img
                className={styles.frameChild}
                alt=""
                src="/rectangle-512@2x.png"
              />
              <div className={styles.vuesaxlinearheartContainer}>
                <img
                  className={styles.vuesaxlinearheartIcon}
                  loading="lazy"
                  alt=""
                  src="/vuesaxlinearheart.svg"
                />
              </div>
              <div className={styles.firstVillaTitle}>
                <div className={styles.villaMParent}>
                  <div className={styles.villaM}>Villa M</div>
                  <div className={styles.title}>Mykonos</div>
                </div>
                <div className={styles.title1}>From € 12,000.00 / Night</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.secondVillaCard}>
          <div className={styles.frameDiv}>
            <div className={styles.imageParent} onClick={onRectangleImageClick}>
              <img className={styles.imageIcon} alt="" src="/image6@2x.png" />
              <div className={styles.secondVillaHeart}>
                <img
                  className={styles.vuesaxlinearheartIcon}
                  loading="lazy"
                  alt=""
                  src="/vuesaxlinearheart.svg"
                />
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.secondVillaName}>
                <div className={styles.breeze}>Breeze</div>
                <div className={styles.title2}>Mykonos</div>
              </div>
              <div className={styles.title1}>
                <p className={styles.from1200000}>{`From € 12,000.00 `}</p>
                <p className={styles.from1200000}>/ Night</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.thirdVillaCard}>
          <div
            className={styles.rectangleContainer}
            onClick={onRectangleImageClick}
          >
            <img
              className={styles.imageIcon}
              alt=""
              src="/rectangle-51-11@2x.png"
            />
            <div className={styles.thirdVillaHeart}>
              <img
                className={styles.vuesaxlinearheartIcon}
                loading="lazy"
                alt=""
                src="/vuesaxlinearheart.svg"
              />
            </div>
          </div>
          <div className={styles.bottom1}>
            <div className={styles.villaMParent}>
              <div className={styles.villaM}>CASA XOLO</div>
              <div className={styles.title}>Tulum</div>
            </div>
            <div className={styles.title1}>From € 12,000.00 / Night</div>
          </div>
        </div>
        <div className={styles.fourthVillaCard}>
          <div className={styles.imageGroup} onClick={onRectangleImageClick}>
            <img className={styles.imageIcon} alt="" src="/image-17@2x.png" />
            <div className={styles.image}>
              <img
                className={styles.vuesaxlinearheartIcon}
                loading="lazy"
                alt=""
                src="/vuesaxlinearheart.svg"
              />
            </div>
          </div>
          <div className={styles.bottom2}>
            <div className={styles.villaMParent}>
              <div className={styles.villaM}>Villa AMAITE</div>
              <div className={styles.title}>Tulum</div>
            </div>
            <div className={styles.title1}>From € 12,000.00 / Night</div>
          </div>
        </div>
      </div>
      <h1 className={styles.luna}>Luna</h1>
      <h3 className={styles.ibiza}>IBIZA</h3>
    </section>
  );
};

export default GroupComponent2;
