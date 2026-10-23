import type { NextPage } from "next";
import styles from "./team-info2.module.css"

export type TeamInfo2Type = {
  className?: string;
};

const TeamInfo2: NextPage<TeamInfo2Type> = ({ className = "" }) => {
  return (
    <section className={[styles.teamInfo, className].join(" ")}>
      <div className={styles.groupParent}>
        <img
          className={styles.frameChild}
          loading="lazy"
          alt=""
          src="/group-107@2x.png"
        />
        <div className={styles.topLevelCommercial}>
          Top level commercial and residential real estate services
        </div>
        <div className={styles.groupWrapper}>
          <div className={styles.capa1Wrapper}>
            <div className={styles.capa1} />
          </div>
        </div>
      </div>
      <div className={styles.frameParent}>
        <div className={styles.groupContainer}>
          <img
            className={styles.frameItem}
            loading="lazy"
            alt=""
            src="/group-105@2x.png"
          />
          <div className={styles.topQualityHospitality}>
            Top quality hospitality and brand consultancy services
          </div>
          <div className={styles.groupFrame}>
            <div className={styles.capa1Wrapper}>
              <div className={styles.capa1} />
            </div>
          </div>
        </div>
        <div className={styles.frameDiv}>
          <img
            className={styles.frameInner}
            loading="lazy"
            alt=""
            src="/group-106@2x.png"
          />
          <div className={styles.caringConsultancy}>
            <div className={styles.caringAndPersonalTEST}>
              Caring and personal consultancy processes
            </div>
          </div>
        </div>
      </div>
      <div className={styles.teamInfoInner}>
        <img
          className={styles.groupIcon}
          loading="lazy"
          alt=""
          src="/group-108@2x.png"
        />
        <div className={styles.safeAndProsperous}>
          Safe and prosperous investment opportunities
        </div>
      </div>
    </section>
  );
};

export default TeamInfo2;
