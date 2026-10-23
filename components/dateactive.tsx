import type { NextPage } from "next";
import Dateactive1 from "./dateactive1"
import styles from "./dateactive.module.css"

export type DateactiveType = {
  className?: string;
};

const Dateactive: NextPage<DateactiveType> = ({ className = "" }) => {
  return (
    <div className={[styles.dateactive, className].join(" ")}>
      <Dateactive1
        prop="19"
        propFlex="unset"
        propWidth="30px"
        propBorderRadius="29px"
        propBackgroundColor="#d99330"
        propColor="#fff"
      />
    </div>
  );
};

export default Dateactive;
