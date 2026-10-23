import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconPhone from "./icon-phone"
import NavvuesaxlinearProperty38Icon from "./navvuesaxlinear-property38-icon"
import NavvuesaxlinearProperty37Icon from "./navvuesaxlinear-property37-icon"
import styles from "./nav.module.css"

export type NavType = {
  className?: string;
  showImage?: boolean;
  capa1?: string;
  iconPhone?: string;
  navvuesaxlinearProperty38?: string;

  /** Style props */
  propHeight?: CSSProperties["height"];
  propPosition?: CSSProperties["position"];
  propTop?: CSSProperties["top"];
  propLeft?: CSSProperties["left"];
  propWidth?: CSSProperties["width"];
  propHeight1?: CSSProperties["height"];
  propHeight2?: CSSProperties["height"];
  propWidth1?: CSSProperties["width"];
  propHeight3?: CSSProperties["height"];
  propWidth2?: CSSProperties["width"];
  propDisplay?: CSSProperties["display"];
  propHeight4?: CSSProperties["height"];
  propWidth3?: CSSProperties["width"];
  propHeight5?: CSSProperties["height"];
  propHeight6?: CSSProperties["height"];
  propHeight7?: CSSProperties["height"];
  propWidth4?: CSSProperties["width"];
  propPadding?: CSSProperties["padding"];
  propFlex?: CSSProperties["flex"];
  propHeight8?: CSSProperties["height"];
  propWidth5?: CSSProperties["width"];
  propHeight9?: CSSProperties["height"];
  propHeight10?: CSSProperties["height"];
  propHeight11?: CSSProperties["height"];
  propWidth6?: CSSProperties["width"];
  propHeight12?: CSSProperties["height"];
  propWidth7?: CSSProperties["width"];
  propPadding1?: CSSProperties["padding"];
  propFlex1?: CSSProperties["flex"];
  propHeight13?: CSSProperties["height"];
  propWidth8?: CSSProperties["width"];
  propHeight14?: CSSProperties["height"];
  propWidth9?: CSSProperties["width"];
  propHeight15?: CSSProperties["height"];
};

const Nav: NextPage<NavType> = ({
  className = "",
  showImage = false,
  propHeight,
  propPosition,
  propTop,
  propLeft,
  propWidth,
  propHeight1,
  propHeight2,
  propWidth1,
  propHeight3,
  propWidth2,
  propDisplay,
  propHeight4,
  propWidth3,
  propHeight5,
  propHeight6,
  propHeight7,
  propWidth4,
  propPadding,
  propFlex,
  propHeight8,
  propWidth5,
  propHeight9,
  propHeight10,
  propHeight11,
  propWidth6,
  capa1,
  propHeight12,
  propWidth7,
  propPadding1,
  propFlex1,
  propHeight13,
  propWidth8,
  propHeight14,
  propWidth9,
  propHeight15,
  iconPhone,
  navvuesaxlinearProperty38,
}) => {
  const navStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight,
      position: propPosition,
      top: propTop,
      left: propLeft,
    };
  }, [propHeight, propPosition, propTop, propLeft]);

  const topMenuStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
      height: propHeight1,
    };
  }, [propWidth, propHeight1]);

  const buttonStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight2,
      width: propWidth1,
    };
  }, [propHeight2, propWidth1]);

  const aStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight3,
      width: propWidth2,
      display: propDisplay,
    };
  }, [propHeight3, propWidth2, propDisplay]);

  const button1Style: CSSProperties = useMemo(() => {
    return {
      height: propHeight4,
      width: propWidth3,
    };
  }, [propHeight4, propWidth3]);

  const contactStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight5,
    };
  }, [propHeight5]);

  const topNavStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight6,
    };
  }, [propHeight6]);

  const pageLinksStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight7,
      width: propWidth4,
      padding: propPadding,
      flex: propFlex,
    };
  }, [propHeight7, propWidth4, propPadding, propFlex]);

  const vacationRentals1Style: CSSProperties = useMemo(() => {
    return {
      height: propHeight8,
      width: propWidth5,
    };
  }, [propHeight8, propWidth5]);

  const concierge1Style: CSSProperties = useMemo(() => {
    return {
      height: propHeight9,
    };
  }, [propHeight9]);

  const eventsStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight10,
    };
  }, [propHeight10]);

  const realEstateStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight11,
      width: propWidth6,
    };
  }, [propHeight11, propWidth6]);

  const rightStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight12,
      width: propWidth7,
      padding: propPadding1,
      flex: propFlex1,
    };
  }, [propHeight12, propWidth7, propPadding1, propFlex1]);

  const weManageYourStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight13,
      width: propWidth8,
    };
  }, [propHeight13, propWidth8]);

  const logInStyle: CSSProperties = useMemo(() => {
    return {
      height: propHeight14,
      width: propWidth9,
    };
  }, [propHeight14, propWidth9]);

  const logIn1Style: CSSProperties = useMemo(() => {
    return {
      height: propHeight15,
    };
  }, [propHeight15]);

  return (
    <header className={[styles.nav, className].join(" ")} style={navStyle}>
      <div className={styles.topMenu} style={topMenuStyle}>
        <div className={styles.button} style={buttonStyle}>
          <IconPhone iconPhone={iconPhone} />
          <a
            className={styles.a}
            href="tel:+302108947139"
            target="_blank"
            style={aStyle}
          >
            +30 21089 47139
          </a>
        </div>
        <div className={styles.button1} style={button1Style}>
          <img
            className={styles.vuesaxlinearsmsIcon}
            alt=""
            src="/vuesaxlinearsms2.svg"
          />
          <div className={styles.contact} style={contactStyle}>
            Contact
          </div>
        </div>
      </div>
      <div className={styles.topNav} style={topNavStyle}>
        <nav className={styles.pageLinks} style={pageLinksStyle}>
          <div className={styles.vacationRentals} style={vacationRentals1Style}>
            Vacation Rentals
          </div>
          <div className={styles.concierge} style={concierge1Style}>
            Concierge
          </div>
          <div className={styles.events} style={eventsStyle}>
            Events
          </div>
          <div className={styles.realEstate} style={realEstateStyle}>
            Real Estate
          </div>
        </nav>
        <img className={styles.capa1Icon} loading="lazy" alt="" src={capa1} />
        <div className={styles.right} style={rightStyle}>
          <div className={styles.weManageYour} style={weManageYourStyle}>
            We Manage Your2 Villas
          </div>
          <button className={styles.logIn} style={logInStyle}>
            <div className={styles.logIn1} style={logIn1Style}>
              Log In
            </div>
          </button>
          {showImage && (
            <div className={styles.image}>
              <img className={styles.imageIcon} alt="" src="/image-12@2x.png" />
              <NavvuesaxlinearProperty38Icon navvuesaxlinearProperty39="/navvuesaxlinearproperty-392.svg" />
            </div>
          )}
          <NavvuesaxlinearProperty37Icon
            navvuesaxlinearProperty38={navvuesaxlinearProperty38}
          />
        </div>
      </div>
    </header>
  );
};

export default Nav;
