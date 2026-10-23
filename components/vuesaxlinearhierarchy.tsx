import type { NextPage } from "next";
import styles from "./vuesaxlinearhierarchy.module.css"

export type VuesaxlinearhierarchyType = {
  className?: string;
  vuesaxlinearhierarchy2?: string;
};

const Vuesaxlinearhierarchy: NextPage<VuesaxlinearhierarchyType> = ({
  className = "",
  vuesaxlinearhierarchy2,
}) => {
  return (
    <div className={[styles.vuesaxlinearhierarchy2, className].join(" ")}>
      <img
        className={styles.vuesaxlinearhierarchy2Icon}
        alt=""
        src={vuesaxlinearhierarchy2}
      />
    </div>
  );
};

export default Vuesaxlinearhierarchy;
