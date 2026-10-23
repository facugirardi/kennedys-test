import type { NextPage } from "next";
import styles from "./icon-linkedin.module.css"

export type IconLinkedinType = {
  className?: string;
  iconLinkedin?: string;
};

const IconLinkedin: NextPage<IconLinkedinType> = ({
  className = "",
  iconLinkedin,
}) => {
  return (
    <img
      className={[styles.iconLinkedin, className].join(" ")}
      alt=""
      src={iconLinkedin}
    />
  );
};

export default IconLinkedin;
