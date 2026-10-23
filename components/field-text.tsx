import type { NextPage } from "next";
import styles from "./field-text.module.css"
import React from "react";

export type FieldTextType = {
  className?: string;
  placeholder?: string;
  showChips?: boolean;
  showLeadingIcon?: boolean;
  showTrailingIcon?: boolean;
  type?: "text" | "email";
  value?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FieldText: NextPage<FieldTextType> = ({
  className = "",
  placeholder,
  showChips = false,
  showLeadingIcon = false,
  showTrailingIcon = false,
  type = "text",
  value = "",
  onChange,
  name,
}) => {
  return (
    <div className={[styles.fieldText, className].join(" ")}>
      <div className={styles.container}>
        <input
          type={type}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
        />
        {showChips && (
          <div className={styles.chips}>
            {/* Chips content */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldText;