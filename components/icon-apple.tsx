import type { NextPage } from "next";
import styles from "./icon-apple.module.css"

export type IconAppleType = {
  className?: string;
};

const IconApple: NextPage<IconAppleType> = ({ className = "" }) => {
  return (
    <img
      className={[styles.iconApple, className].join(" ")}
      alt=""
      src="/icon--apple.svg"
    />
  );
};

export default IconApple;
