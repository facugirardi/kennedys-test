import type { NextPage } from "next";
import Nav from "./nav"
import styles from "./frame-component6.module.css"

export type FrameComponent6Type = {
  className?: string;
};

const FrameComponent6: NextPage<FrameComponent6Type> = ({ className = "" }) => {
  return (
    <section className={[styles.navWrapper, className].join(" ")}>
      <Nav
        showImage
        capa1="/capa-1-3.svg"
        iconPhone="/icon--phone2.svg"
        navvuesaxlinearProperty38="/navvuesaxlinearproperty-382.svg"
      />
    </section>
  );
};

export default FrameComponent6;
