import type { NextPage } from "next";
import { useMemo, type CSSProperties, useCallback } from "react";
import IconPhone from "./icon-phone"
import { useRouter } from "next/router";
import NavvuesaxlinearProperty38Icon from "./navvuesaxlinear-property38-icon"
import NavvuesaxlinearProperty37Icon from "./navvuesaxlinear-property37-icon"
import styles from "./nav-final.module.css"

export type NavFinalType = {
  className?: string;
  showImage?: boolean;
  vuesaxlinearsms?: string;
  capa1?: string;
  image?: string;
  iconPhone?: string;
  navvuesaxlinearProperty39?: string;
  navvuesaxlinearProperty38?: string;

  /** Style props */
  propLeft?: CSSProperties["left"];
  propWidth?: CSSProperties["width"];
  propWidth1?: CSSProperties["width"];
};

const NavFinal: NextPage<NavFinalType> = ({
  className = "",
  showImage = false,
  propLeft,
  vuesaxlinearsms,
  propWidth,
  propWidth1,
  capa1,
  image,
  iconPhone,
  navvuesaxlinearProperty39,
  navvuesaxlinearProperty38,
}) => {
  const navFinalStyle: CSSProperties = useMemo(() => {
    return {
      left: propLeft,
    };
  }, [propLeft]);

  const vacationRentalsStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
    };
  }, [propWidth]);

  const conciergeStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth1,
    };
  }, [propWidth1]);

  const router = useRouter();


  const onVacationRentalsTextClick = useCallback(() => {
    router.push("/villas");
  }, [router]);

  const onConciergeTextClick = useCallback(() => {
    router.push("/concierge");
  }, [router]);

  const onEventsTextClick = useCallback(() => {
    router.push("/events");
  }, [router]);

  const onRealEstateTextClick = useCallback(() => {
    router.push("/real-estate");
  }, [router]);

  const onWeManageYourClick = useCallback(() => {
    router.push("/we-manage");
  }, [router]);

  return (
    <>
      <header className={styles.navFinal}>
        <div className={styles.topMenu}>
          <div className={styles.button}>
            <IconPhone iconPhone="/icon--phone2.svg" />
            <a className={styles.a} href="tel:+302108947139" target="_blank">
              +30 21089 47139
            </a>
          </div>
          <div className={styles.button1}>
            <img
              className={styles.vuesaxlinearsmsIcon}
              alt=""
              src="/vuesaxlinearsms2.svg"
            />
            <div className={styles.contact}>Contact</div>
          </div>
        </div>
        <div className={styles.topNav}>
          <nav className={styles.services}>
            <div
              className={styles.vacationRentals}
              onClick={onVacationRentalsTextClick}
            >
              Vacation Rentalss
            </div>
            <div
              className={styles.concierge1}
              onClick={onConciergeTextClick}
            >
              Concierge
            </div>
            <div className={styles.events1} onClick={onEventsTextClick}>
              Events
            </div>
            <div
              className={styles.realEstate1}
              onClick={onRealEstateTextClick}
            >
              Real Estate
            </div>
          </nav>
          <img
            className={styles.capa1Icon}
            loading="lazy"
            alt=""
            src="/capa-1-3.svg"
          />
          <div className={styles.right}>
            <div className={styles.image}>
              <img
                className={styles.imageIcon}
                loading="lazy"
                alt=""
                src="/image-12@2x.png"
              />
              <NavvuesaxlinearProperty38Icon navvuesaxlinearProperty39="/navvuesaxlinearproperty-392.svg" />
            </div>
            <NavvuesaxlinearProperty37Icon navvuesaxlinearProperty38="/navvuesaxlinearproperty-382.svg" />
          </div>
        </div>
      </header>
    </>
  );
};

export default NavFinal;
