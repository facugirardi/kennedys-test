import type { NextPage } from "next";
import styles from "./buttons.module.css"

export type ButtonsType = {
  className?: string;
  showLeadingIcon?: boolean;
  label?: string;
  onClick?: (e?: React.MouseEvent | React.FormEvent) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const Buttons: NextPage<ButtonsType> = ({
  className = "",
  showLeadingIcon = false,
  label = "Continue With Email",
  onClick,
  type = "button",
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent | React.FormEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={[styles.buttons, className].join(" ")}
      onClick={handleClick}
      type={type}
      disabled={disabled}
    >
      {showLeadingIcon && (
        <img className={styles.iconPlus} alt="" src="/icon--plus.svg" />
      )}
      <div className={styles.container}>
        <div className={styles.label}>{label}</div>
      </div>
    </button>
  );
};

export default Buttons;