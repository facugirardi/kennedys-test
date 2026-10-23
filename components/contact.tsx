import type { NextPage } from "next";
import IconChevron from "./icon-chevron"
import IconCalendar from "./icon-calendar"
import styles from "./contact.module.css"

export type ContactType = {
  className?: string;
  onClose?: () => void;
};

const Contact: NextPage<ContactType> = ({ className = "", onClose }) => {
  return (
    <div className={[styles.contact, className].join(" ")}>
      TEST
    </div>
  );
};

export default Contact;
