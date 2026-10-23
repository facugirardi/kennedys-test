import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import IconChevron from "./icon-chevron"
import styles from "./filter-option-list.module.css"

export type FilterOptionListType = {
  className?: string;
  location1?: string;
  leadingIcon?: string;
  all?: string;
  leadingIcon1?: string;
  trailingIcon?: string;
  leadingIcon2?: string;
  trailingIcon1?: string;
  trailingIcon2?: string;
  iconChevron?: string;
  propWidth1?: string;
  propHeight?: string;

  /** Style props */
  propWidth?: CSSProperties["width"];
  propAlignSelf?: CSSProperties["alignSelf"];
  propAlignSelf1?: CSSProperties["alignSelf"];
  propFlexWrap?: CSSProperties["flexWrap"];
  propAlignContent?: CSSProperties["alignContent"];
  propFlex?: CSSProperties["flex"];
  propFlex1?: CSSProperties["flex"];
  propMinWidth?: CSSProperties["minWidth"];
  propPadding?: CSSProperties["padding"];
  propAlignSelf2?: CSSProperties["alignSelf"];
};

const FilterOptionList: NextPage<FilterOptionListType> = ({
  className = "",
  propWidth,
  propAlignSelf,
  location1,
  propAlignSelf1,
  propFlexWrap,
  propAlignContent,
  propFlex,
  leadingIcon,
  propFlex1,
  propMinWidth,
  all,
  propPadding,
  propAlignSelf2,
  leadingIcon1,
  trailingIcon,
  leadingIcon2,
  trailingIcon1,
  trailingIcon2,
  iconChevron,
  propWidth1,
  propHeight,
}) => {
  const filterOptionListStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth,
      alignSelf: propAlignSelf,
    };
  }, [propWidth, propAlignSelf]);

  const fieldText1Style: CSSProperties = useMemo(() => {
    return {
      alignSelf: propAlignSelf1,
      flexWrap: propFlexWrap,
      alignContent: propAlignContent,
      flex: propFlex,
    };
  }, [propAlignSelf1, propFlexWrap, propAlignContent, propFlex]);

  const container4Style: CSSProperties = useMemo(() => {
    return {
      flex: propFlex1,
      minWidth: propMinWidth,
    };
  }, [propFlex1, propMinWidth]);

  const chips1Style: CSSProperties = useMemo(() => {
    return {
      padding: propPadding,
      alignSelf: propAlignSelf2,
    };
  }, [propPadding, propAlignSelf2]);

  return (
    <div
      className={[styles.filterOptionList, className].join(" ")}
      style={filterOptionListStyle}
    >
      <div className={styles.location}>{location1}</div>
      <div className={styles.fieldText} style={fieldText1Style}>
        <img className={styles.leadingIcon} alt="" src={leadingIcon} />
        <div className={styles.container} style={container4Style}>
          <div className={styles.all}>{all}</div>
          <div className={styles.chips} style={chips1Style}>
            <div className={styles.chip}>
              <img className={styles.leadingIcon1} alt="" src={leadingIcon1} />
              <div className={styles.label}>{`Chip `}</div>
              <b className={styles.number}>213</b>
              <img className={styles.trailingIcon} alt="" src={trailingIcon} />
            </div>
            <div className={styles.chip}>
              <img className={styles.leadingIcon1} alt="" src={leadingIcon2} />
              <div className={styles.label}>Chip</div>
              <b className={styles.number}>213</b>
              <img className={styles.trailingIcon} alt="" src={trailingIcon1} />
            </div>
            <div className={styles.div}>+2</div>
          </div>
        </div>
        <IconChevron
          iconChevron={iconChevron}
          propWidth={propWidth1}
          propHeight={propHeight}
        />
        <img className={styles.leadingIcon} alt="" src={trailingIcon2} />
      </div>
    </div>
  );
};

export default FilterOptionList;
