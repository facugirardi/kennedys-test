import type { NextPage } from "next";
import Dateinactive from "./dateinactive"
import styles from "./dateactive1.module.css"

export type Dateactive1Type = {
  className?: string;
  prop?: string;
  propFlex?: string;
  propWidth?: string;
  propBorderRadius?: string;
  propBackgroundColor?: string;
  propColor?: string;
};

const Dateactive1: NextPage<Dateactive1Type> = ({
  className = "",
  prop,
  propFlex,
  propWidth,
  propBorderRadius,
  propBackgroundColor,
  propColor,
}) => {
  return (
    <div className={[styles.dateactive, className].join(" ")}>
      <Dateinactive
        propFlex={propFlex}
        propWidth={propWidth}
        propBorderRadius={propBorderRadius}
        propBackgroundColor={propBackgroundColor}
        prop={prop}
        propColor={propColor}
      />
    </div>
  );
};

export default Dateactive1;
