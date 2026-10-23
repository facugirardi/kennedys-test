import type { NextPage } from "next";
import styles from "./vuesaxlinearcandle2-icon.module.css"

export type Vuesaxlinearcandle2IconType = {
  className?: string;
  vuesaxlinearcandle2?: string;
};

const Vuesaxlinearcandle2Icon: NextPage<Vuesaxlinearcandle2IconType> = ({
  className = "",
  vuesaxlinearcandle2,
}) => {
  return (
    <img
      className={[styles.vuesaxlinearcandle2Icon, className].join(" ")}
      alt=""
      src={vuesaxlinearcandle2}
    />
  );
};

export default Vuesaxlinearcandle2Icon;
