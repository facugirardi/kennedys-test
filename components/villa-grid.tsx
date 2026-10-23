import type { NextPage } from "next";
import VillaItems from "./villa-items"
import styles from "./villa-grid.module.css"

export type VillaGridType = {
  className?: string;
};

const VillaGrid: NextPage<VillaGridType> = ({ className = "" }) => {
  return (
    <div className={[styles.villaGrid, className].join(" ")}>
      <div className={styles.row}>
        <VillaItems villaImages="pending_637:5744" capa1="pending_637:5750" />
        <VillaItems villaImages="pending_637:5755" capa1="pending_637:5761" />
        <VillaItems villaImages="pending_637:5766" capa1="pending_637:5772" />
      </div>
    </div>
  );
};

export default VillaGrid;
