import type { NextPage } from "next";
import Cta from "./cta"
import styles from "./call-to-action.module.css"

export type CallToActionType = {
  className?: string;
};

const CallToAction: NextPage<CallToActionType> = ({ className = "" }) => {
  return (
    <div className={[styles.callToAction, className].join(" ")}>
      <Cta />
    </div>
  );
};

export default CallToAction;
