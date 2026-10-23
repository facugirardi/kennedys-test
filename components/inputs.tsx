import type { NextPage } from "next";
import React, { useState } from "react";
import Label from "./label"
import FieldText from "./field-text"
import styles from "./inputs.module.css"

export type InputsType = {
  className?: string;
  label?: string;
  mandatory?: boolean;
  info?: boolean;
  optional?: boolean;
  placeholder?: string;
  showChips?: boolean;
  showLeadingIcon?: boolean;
  showTrailingIcon?: boolean;
  type?: "text" | "email";
  value?: string;
  name?: string;
  onChange?: (value: string) => void;
};

const Inputs: NextPage<InputsType> = ({
  className = "",
  label,
  mandatory,
  info,
  optional,
  placeholder,
  showChips,
  showLeadingIcon,
  showTrailingIcon,
  type = "text",
  value,
  name,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setTouched(true);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailInvalid = type === "email" && touched && inputValue && !validateEmail(inputValue);

  return (
    <div className={[styles.inputs, className].join(" ")}>
      <div className={styles.textForDescription}>Text for description</div>
      <Label
        mandatory={mandatory}
        info={info}
        label={label}
        optional={optional}
      />
      <FieldText
        type={type}
        value={inputValue}
        onChange={handleChange}
        showChips={showChips}
        showLeadingIcon={showLeadingIcon}
        placeholder={placeholder}
        showTrailingIcon={showTrailingIcon}
        name={name}
      />
      <div className={styles.helperText}>
        <div className={styles.explanatoryText}>
          <div className={styles.text}>Small Explanatory text</div>
          {!isEmailInvalid && (
            <div className={styles.errorMessage}>
              <p>TODO MAAAAL</p>
              <img className={styles.iconClose} alt="" src="/icon--close6.svg" />
              <div className={styles.errorMessage1}>Please enter a valid email address</div>
            </div>
          )}
          <div className={styles.successMessage}>
            <img className={styles.iconClose} alt="" src="/icon--check7.svg" />
            <div className={styles.errorMessage1}>Success message</div>
          </div>
        </div>
        <div className={styles.counter}>200</div>
      </div>
    </div>
  );
};

export default Inputs;