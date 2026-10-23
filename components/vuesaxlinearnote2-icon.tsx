import type { NextPage } from "next";
import styles from "./vuesaxlinearnote2-icon.module.css"

export type Vuesaxlinearnote2IconType = {
  className?: string;
};

const Vuesaxlinearnote2Icon: NextPage<Vuesaxlinearnote2IconType> = ({
  className = "",
}) => {
  return (
    <img
      className={[styles.vuesaxlinearnote2Icon, className].join(" ")}
      alt=""
      src="/vuesaxlinearnote2.svg"
    />
  );
};

export default Vuesaxlinearnote2Icon;
