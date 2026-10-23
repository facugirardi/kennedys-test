import type { NextPage } from "next";
import Month from "./month"
import Dateinactive from "./dateinactive"
import Dateactive from "./dateactive"
import styles from "./calendar-old.module.css"

export type CalendarType = {
  className?: string;
  monthSAT?: string;
  monthSAT1?: string;
  monthSAT2?: string;
  monthSAT3?: string;
  monthSAT4?: string;
  monthSAT5?: string;
  monthSAT6?: string;
  monthPropWidth?: string;
  monthPropWidth1?: string;
  monthPropWidth2?: string;
  monthPropWidth3?: string;
  monthPropWidth4?: string;
  monthPropWidth5?: string;
  monthPropWidth6?: string;
  dateinactiveProp?: string;
  dateinactiveProp1?: string;
  dateinactiveProp2?: string;
  dateinactiveProp3?: string;
  dateinactiveProp4?: string;
  dateinactiveProp5?: string;
  dateinactiveProp6?: string;
  dateinactiveProp7?: string;
  dateinactiveProp8?: string;
  dateinactiveProp9?: string;
  dateinactiveProp10?: string;
  dateinactiveProp11?: string;
  dateinactiveProp12?: string;
  dateinactiveProp13?: string;
  dateinactiveProp14?: string;
  dateinactiveProp15?: string;
  dateinactiveProp16?: string;
  dateinactiveProp17?: string;
  dateinactiveProp18?: string;
  dateinactiveProp19?: string;
  dateinactiveProp20?: string;
  dateinactiveProp21?: string;
  dateinactiveProp22?: string;
  dateinactiveProp23?: string;
  dateinactiveProp24?: string;
  dateinactiveProp25?: string;
  dateinactiveProp26?: string;
  dateinactiveProp27?: string;
  dateinactiveProp28?: string;
  dateinactiveProp29?: string;
  dateinactiveProp30?: string;
  dateinactiveProp31?: string;
  dateinactiveProp32?: string;
  dateinactiveProp33?: string;
  dateinactivePropFlex?: string;
  dateinactivePropFlex1?: string;
  dateinactivePropFlex2?: string;
  dateinactivePropFlex3?: string;
  dateinactivePropFlex4?: string;
  dateinactivePropFlex5?: string;
  dateinactivePropFlex6?: string;
  dateinactivePropFlex7?: string;
  dateinactivePropFlex8?: string;
  dateinactivePropFlex9?: string;
  dateinactivePropFlex10?: string;
  dateinactivePropFlex11?: string;
  dateinactivePropFlex12?: string;
  dateinactivePropFlex13?: string;
  dateinactivePropFlex14?: string;
  dateinactivePropFlex15?: string;
  dateinactivePropFlex16?: string;
  dateinactivePropFlex17?: string;
  dateinactivePropFlex18?: string;
  dateinactivePropFlex19?: string;
  dateinactivePropFlex20?: string;
  dateinactivePropFlex21?: string;
  dateinactivePropFlex22?: string;
  dateinactivePropFlex23?: string;
  dateinactivePropFlex24?: string;
  dateinactivePropFlex25?: string;
  dateinactivePropFlex26?: string;
  dateinactivePropFlex27?: string;
  dateinactivePropFlex28?: string;
  dateinactivePropFlex29?: string;
  dateinactivePropFlex30?: string;
  dateinactivePropFlex31?: string;
  dateinactivePropFlex32?: string;
  dateinactivePropFlex33?: string;
  dateinactivePropWidth?: string;
  dateinactivePropWidth1?: string;
  dateinactivePropWidth2?: string;
  dateinactivePropWidth3?: string;
  dateinactivePropWidth4?: string;
  dateinactivePropWidth5?: string;
  dateinactivePropWidth6?: string;
  dateinactivePropWidth7?: string;
  dateinactivePropWidth8?: string;
  dateinactivePropWidth9?: string;
  dateinactivePropWidth10?: string;
  dateinactivePropWidth11?: string;
  dateinactivePropWidth12?: string;
  dateinactivePropWidth13?: string;
  dateinactivePropWidth14?: string;
  dateinactivePropWidth15?: string;
  dateinactivePropWidth16?: string;
  dateinactivePropWidth17?: string;
  dateinactivePropWidth18?: string;
  dateinactivePropWidth19?: string;
  dateinactivePropWidth20?: string;
  dateinactivePropWidth21?: string;
  dateinactivePropWidth22?: string;
  dateinactivePropWidth23?: string;
  dateinactivePropWidth24?: string;
  dateinactivePropWidth25?: string;
  dateinactivePropWidth26?: string;
  dateinactivePropWidth27?: string;
  dateinactivePropWidth28?: string;
  dateinactivePropWidth29?: string;
  dateinactivePropWidth30?: string;
  dateinactivePropWidth31?: string;
  dateinactivePropWidth32?: string;
  dateinactivePropWidth33?: string;
  dateinactivePropBorderRadius?: string;
  dateinactivePropBorderRadius1?: string;
  dateinactivePropBorderRadius2?: string;
  dateinactivePropBorderRadius3?: string;
  dateinactivePropBorderRadius4?: string;
  dateinactivePropBorderRadius5?: string;
  dateinactivePropBorderRadius6?: string;
  dateinactivePropBorderRadius7?: string;
  dateinactivePropBorderRadius8?: string;
  dateinactivePropBorderRadius9?: string;
  dateinactivePropBorderRadius10?: string;
  dateinactivePropBorderRadius11?: string;
  dateinactivePropBorderRadius12?: string;
  dateinactivePropBorderRadius13?: string;
  dateinactivePropBorderRadius14?: string;
  dateinactivePropBorderRadius15?: string;
  dateinactivePropBorderRadius16?: string;
  dateinactivePropBorderRadius17?: string;
  dateinactivePropBorderRadius18?: string;
  dateinactivePropBorderRadius19?: string;
  dateinactivePropBorderRadius20?: string;
  dateinactivePropBorderRadius21?: string;
  dateinactivePropBorderRadius22?: string;
  dateinactivePropBorderRadius23?: string;
  dateinactivePropBorderRadius24?: string;
  dateinactivePropBorderRadius25?: string;
  dateinactivePropBorderRadius26?: string;
  dateinactivePropBorderRadius27?: string;
  dateinactivePropBorderRadius28?: string;
  dateinactivePropBorderRadius29?: string;
  dateinactivePropBorderRadius30?: string;
  dateinactivePropBorderRadius31?: string;
  dateinactivePropBorderRadius32?: string;
  dateinactivePropBorderRadius33?: string;
  dateinactivePropBackground?: string;
  dateinactivePropBackground1?: string;
  dateinactivePropBackground2?: string;
  dateinactivePropBackground3?: string;
  dateinactivePropBackground4?: string;
  dateinactivePropBackground5?: string;
  dateinactivePropBackground6?: string;
  dateinactivePropBackground7?: string;
  dateinactivePropBackground8?: string;
  dateinactivePropBackground9?: string;
  dateinactivePropBackground10?: string;
  dateinactivePropBackground11?: string;
  dateinactivePropBackground12?: string;
  dateinactivePropBackground13?: string;
  dateinactivePropBackground14?: string;
  dateinactivePropBackground15?: string;
  dateinactivePropBackground16?: string;
  dateinactivePropBackground17?: string;
  dateinactivePropBackground18?: string;
  dateinactivePropBackground19?: string;
  dateinactivePropBackground20?: string;
  dateinactivePropBackground21?: string;
  dateinactivePropBackground22?: string;
  dateinactivePropBackground23?: string;
  dateinactivePropBackground24?: string;
  dateinactivePropBackground25?: string;
  dateinactivePropBackground26?: string;
  dateinactivePropBackground27?: string;
  dateinactivePropBackground28?: string;
  dateinactivePropBackground29?: string;
  dateinactivePropBackground30?: string;
  dateinactivePropBackground31?: string;
  dateinactivePropBackground32?: string;
  dateinactivePropBackground33?: string;
  dateinactivePropColor?: string;
  dateinactivePropColor1?: string;
  dateinactivePropColor2?: string;
  dateinactivePropColor3?: string;
  dateinactivePropColor4?: string;
  dateinactivePropColor5?: string;
  dateinactivePropColor6?: string;
  dateinactivePropColor7?: string;
  dateinactivePropColor8?: string;
  dateinactivePropColor9?: string;
  dateinactivePropColor10?: string;
  dateinactivePropColor11?: string;
  dateinactivePropColor12?: string;
  dateinactivePropColor13?: string;
  dateinactivePropColor14?: string;
  dateinactivePropColor15?: string;
  dateinactivePropColor16?: string;
  dateinactivePropColor17?: string;
  dateinactivePropColor18?: string;
  dateinactivePropColor19?: string;
  dateinactivePropColor20?: string;
  dateinactivePropColor21?: string;
  dateinactivePropColor22?: string;
  dateinactivePropColor23?: string;
  dateinactivePropColor24?: string;
  dateinactivePropColor25?: string;
  dateinactivePropColor26?: string;
  dateinactivePropColor27?: string;
  dateinactivePropColor28?: string;
  dateinactivePropColor29?: string;
  dateinactivePropColor30?: string;
  dateinactivePropColor31?: string;
  dateinactivePropColor32?: string;
  dateinactivePropColor33?: string;
};

const Calendar: NextPage<CalendarType> = ({
  className = "",
  monthSAT,
  monthSAT1,
  monthSAT2,
  monthSAT3,
  monthSAT4,
  monthSAT5,
  monthSAT6,
  monthPropWidth,
  monthPropWidth1,
  monthPropWidth2,
  monthPropWidth3,
  monthPropWidth4,
  monthPropWidth5,
  monthPropWidth6,
  dateinactiveProp,
  dateinactiveProp1,
  dateinactiveProp2,
  dateinactiveProp3,
  dateinactiveProp4,
  dateinactiveProp5,
  dateinactiveProp6,
  dateinactiveProp7,
  dateinactiveProp8,
  dateinactiveProp9,
  dateinactiveProp10,
  dateinactiveProp11,
  dateinactiveProp12,
  dateinactiveProp13,
  dateinactiveProp14,
  dateinactiveProp15,
  dateinactiveProp16,
  dateinactiveProp17,
  dateinactiveProp18,
  dateinactiveProp19,
  dateinactiveProp20,
  dateinactiveProp21,
  dateinactiveProp22,
  dateinactiveProp23,
  dateinactiveProp24,
  dateinactiveProp25,
  dateinactiveProp26,
  dateinactiveProp27,
  dateinactiveProp28,
  dateinactiveProp29,
  dateinactiveProp30,
  dateinactiveProp31,
  dateinactiveProp32,
  dateinactiveProp33,
  dateinactivePropFlex,
  dateinactivePropFlex1,
  dateinactivePropFlex2,
  dateinactivePropFlex3,
  dateinactivePropFlex4,
  dateinactivePropFlex5,
  dateinactivePropFlex6,
  dateinactivePropFlex7,
  dateinactivePropFlex8,
  dateinactivePropFlex9,
  dateinactivePropFlex10,
  dateinactivePropFlex11,
  dateinactivePropFlex12,
  dateinactivePropFlex13,
  dateinactivePropFlex14,
  dateinactivePropFlex15,
  dateinactivePropFlex16,
  dateinactivePropFlex17,
  dateinactivePropFlex18,
  dateinactivePropFlex19,
  dateinactivePropFlex20,
  dateinactivePropFlex21,
  dateinactivePropFlex22,
  dateinactivePropFlex23,
  dateinactivePropFlex24,
  dateinactivePropFlex25,
  dateinactivePropFlex26,
  dateinactivePropFlex27,
  dateinactivePropFlex28,
  dateinactivePropFlex29,
  dateinactivePropFlex30,
  dateinactivePropFlex31,
  dateinactivePropFlex32,
  dateinactivePropFlex33,
  dateinactivePropWidth,
  dateinactivePropWidth1,
  dateinactivePropWidth2,
  dateinactivePropWidth3,
  dateinactivePropWidth4,
  dateinactivePropWidth5,
  dateinactivePropWidth6,
  dateinactivePropWidth7,
  dateinactivePropWidth8,
  dateinactivePropWidth9,
  dateinactivePropWidth10,
  dateinactivePropWidth11,
  dateinactivePropWidth12,
  dateinactivePropWidth13,
  dateinactivePropWidth14,
  dateinactivePropWidth15,
  dateinactivePropWidth16,
  dateinactivePropWidth17,
  dateinactivePropWidth18,
  dateinactivePropWidth19,
  dateinactivePropWidth20,
  dateinactivePropWidth21,
  dateinactivePropWidth22,
  dateinactivePropWidth23,
  dateinactivePropWidth24,
  dateinactivePropWidth25,
  dateinactivePropWidth26,
  dateinactivePropWidth27,
  dateinactivePropWidth28,
  dateinactivePropWidth29,
  dateinactivePropWidth30,
  dateinactivePropWidth31,
  dateinactivePropWidth32,
  dateinactivePropWidth33,
  dateinactivePropBorderRadius,
  dateinactivePropBorderRadius1,
  dateinactivePropBorderRadius2,
  dateinactivePropBorderRadius3,
  dateinactivePropBorderRadius4,
  dateinactivePropBorderRadius5,
  dateinactivePropBorderRadius6,
  dateinactivePropBorderRadius7,
  dateinactivePropBorderRadius8,
  dateinactivePropBorderRadius9,
  dateinactivePropBorderRadius10,
  dateinactivePropBorderRadius11,
  dateinactivePropBorderRadius12,
  dateinactivePropBorderRadius13,
  dateinactivePropBorderRadius14,
  dateinactivePropBorderRadius15,
  dateinactivePropBorderRadius16,
  dateinactivePropBorderRadius17,
  dateinactivePropBorderRadius18,
  dateinactivePropBorderRadius19,
  dateinactivePropBorderRadius20,
  dateinactivePropBorderRadius21,
  dateinactivePropBorderRadius22,
  dateinactivePropBorderRadius23,
  dateinactivePropBorderRadius24,
  dateinactivePropBorderRadius25,
  dateinactivePropBorderRadius26,
  dateinactivePropBorderRadius27,
  dateinactivePropBorderRadius28,
  dateinactivePropBorderRadius29,
  dateinactivePropBorderRadius30,
  dateinactivePropBorderRadius31,
  dateinactivePropBorderRadius32,
  dateinactivePropBorderRadius33,
  dateinactivePropBackground,
  dateinactivePropBackground1,
  dateinactivePropBackground2,
  dateinactivePropBackground3,
  dateinactivePropBackground4,
  dateinactivePropBackground5,
  dateinactivePropBackground6,
  dateinactivePropBackground7,
  dateinactivePropBackground8,
  dateinactivePropBackground9,
  dateinactivePropBackground10,
  dateinactivePropBackground11,
  dateinactivePropBackground12,
  dateinactivePropBackground13,
  dateinactivePropBackground14,
  dateinactivePropBackground15,
  dateinactivePropBackground16,
  dateinactivePropBackground17,
  dateinactivePropBackground18,
  dateinactivePropBackground19,
  dateinactivePropBackground20,
  dateinactivePropBackground21,
  dateinactivePropBackground22,
  dateinactivePropBackground23,
  dateinactivePropBackground24,
  dateinactivePropBackground25,
  dateinactivePropBackground26,
  dateinactivePropBackground27,
  dateinactivePropBackground28,
  dateinactivePropBackground29,
  dateinactivePropBackground30,
  dateinactivePropBackground31,
  dateinactivePropBackground32,
  dateinactivePropBackground33,
  dateinactivePropColor,
  dateinactivePropColor1,
  dateinactivePropColor2,
  dateinactivePropColor3,
  dateinactivePropColor4,
  dateinactivePropColor5,
  dateinactivePropColor6,
  dateinactivePropColor7,
  dateinactivePropColor8,
  dateinactivePropColor9,
  dateinactivePropColor10,
  dateinactivePropColor11,
  dateinactivePropColor12,
  dateinactivePropColor13,
  dateinactivePropColor14,
  dateinactivePropColor15,
  dateinactivePropColor16,
  dateinactivePropColor17,
  dateinactivePropColor18,
  dateinactivePropColor19,
  dateinactivePropColor20,
  dateinactivePropColor21,
  dateinactivePropColor22,
  dateinactivePropColor23,
  dateinactivePropColor24,
  dateinactivePropColor25,
  dateinactivePropColor26,
  dateinactivePropColor27,
  dateinactivePropColor28,
  dateinactivePropColor29,
  dateinactivePropColor30,
  dateinactivePropColor31,
  dateinactivePropColor32,
  dateinactivePropColor33,
}) => {
  return (
    <div className={[styles.calendar, className].join(" ")}>
      <div className={styles.calendarHeader}>
        <img className={styles.icons} alt="" src="/icons.svg" />
        <div className={styles.september2021}>September 2021</div>
        <img className={styles.icons1} alt="" src="/icons-1.svg" />
      </div>
      <div className={styles.calendarDays}>
        <Month sAT={monthSAT} propWidth={monthPropWidth} />
        <Month sAT={monthSAT1} propWidth={monthPropWidth1} />
        <Month sAT={monthSAT2} propWidth={monthPropWidth2} />
        <Month sAT={monthSAT3} propWidth={monthPropWidth3} />
        <Month sAT={monthSAT4} propWidth={monthPropWidth4} />
        <Month sAT={monthSAT5} propWidth={monthPropWidth5} />
        <Month sAT={monthSAT6} propWidth={monthPropWidth6} />
      </div>
      <div className={styles.calendarDates}>
        <div className={styles.calendarWeek}>
          <Dateinactive
            propFlex={dateinactivePropFlex}
            propWidth={dateinactivePropWidth}
            propBorderRadius={dateinactivePropBorderRadius}
            propBackgroundColor={dateinactivePropBackground}
            prop={dateinactiveProp}
            propColor={dateinactivePropColor}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex1}
            propWidth={dateinactivePropWidth1}
            propBorderRadius={dateinactivePropBorderRadius1}
            propBackgroundColor={dateinactivePropBackground1}
            prop={dateinactiveProp1}
            propColor={dateinactivePropColor1}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex2}
            propWidth={dateinactivePropWidth2}
            propBorderRadius={dateinactivePropBorderRadius2}
            propBackgroundColor={dateinactivePropBackground2}
            prop={dateinactiveProp2}
            propColor={dateinactivePropColor2}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex3}
            propWidth={dateinactivePropWidth3}
            propBorderRadius={dateinactivePropBorderRadius3}
            propBackgroundColor={dateinactivePropBackground3}
            prop={dateinactiveProp3}
            propColor={dateinactivePropColor3}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex4}
            propWidth={dateinactivePropWidth4}
            propBorderRadius={dateinactivePropBorderRadius4}
            propBackgroundColor={dateinactivePropBackground4}
            prop={dateinactiveProp4}
            propColor={dateinactivePropColor4}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex5}
            propWidth={dateinactivePropWidth5}
            propBorderRadius={dateinactivePropBorderRadius5}
            propBackgroundColor={dateinactivePropBackground5}
            prop={dateinactiveProp5}
            propColor={dateinactivePropColor5}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex6}
            propWidth={dateinactivePropWidth6}
            propBorderRadius={dateinactivePropBorderRadius6}
            propBackgroundColor={dateinactivePropBackground6}
            prop={dateinactiveProp6}
            propColor={dateinactivePropColor6}
          />
        </div>
        <div className={styles.calendarWeek}>
          <Dateinactive
            propFlex={dateinactivePropFlex7}
            propWidth={dateinactivePropWidth7}
            propBorderRadius={dateinactivePropBorderRadius7}
            propBackgroundColor={dateinactivePropBackground7}
            prop={dateinactiveProp7}
            propColor={dateinactivePropColor7}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex8}
            propWidth={dateinactivePropWidth8}
            propBorderRadius={dateinactivePropBorderRadius8}
            propBackgroundColor={dateinactivePropBackground8}
            prop={dateinactiveProp8}
            propColor={dateinactivePropColor8}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex9}
            propWidth={dateinactivePropWidth9}
            propBorderRadius={dateinactivePropBorderRadius9}
            propBackgroundColor={dateinactivePropBackground9}
            prop={dateinactiveProp9}
            propColor={dateinactivePropColor9}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex10}
            propWidth={dateinactivePropWidth10}
            propBorderRadius={dateinactivePropBorderRadius10}
            propBackgroundColor={dateinactivePropBackground10}
            prop={dateinactiveProp10}
            propColor={dateinactivePropColor10}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex11}
            propWidth={dateinactivePropWidth11}
            propBorderRadius={dateinactivePropBorderRadius11}
            propBackgroundColor={dateinactivePropBackground11}
            prop={dateinactiveProp11}
            propColor={dateinactivePropColor11}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex12}
            propWidth={dateinactivePropWidth12}
            propBorderRadius={dateinactivePropBorderRadius12}
            propBackgroundColor={dateinactivePropBackground12}
            prop={dateinactiveProp12}
            propColor={dateinactivePropColor12}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex13}
            propWidth={dateinactivePropWidth13}
            propBorderRadius={dateinactivePropBorderRadius13}
            propBackgroundColor={dateinactivePropBackground13}
            prop={dateinactiveProp13}
            propColor={dateinactivePropColor13}
          />
        </div>
        <div className={styles.calendarWeek}>
          <Dateinactive
            propFlex={dateinactivePropFlex14}
            propWidth={dateinactivePropWidth14}
            propBorderRadius={dateinactivePropBorderRadius14}
            propBackgroundColor={dateinactivePropBackground14}
            prop={dateinactiveProp14}
            propColor={dateinactivePropColor14}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex15}
            propWidth={dateinactivePropWidth15}
            propBorderRadius={dateinactivePropBorderRadius15}
            propBackgroundColor={dateinactivePropBackground15}
            prop={dateinactiveProp15}
            propColor={dateinactivePropColor15}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex16}
            propWidth={dateinactivePropWidth16}
            propBorderRadius={dateinactivePropBorderRadius16}
            propBackgroundColor={dateinactivePropBackground16}
            prop={dateinactiveProp16}
            propColor={dateinactivePropColor16}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex17}
            propWidth={dateinactivePropWidth17}
            propBorderRadius={dateinactivePropBorderRadius17}
            propBackgroundColor={dateinactivePropBackground17}
            prop={dateinactiveProp17}
            propColor={dateinactivePropColor17}
          />
          <Dateactive />
          <Dateinactive
            propFlex={dateinactivePropFlex18}
            propWidth={dateinactivePropWidth18}
            propBorderRadius={dateinactivePropBorderRadius18}
            propBackgroundColor={dateinactivePropBackground18}
            prop={dateinactiveProp18}
            propColor={dateinactivePropColor18}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex19}
            propWidth={dateinactivePropWidth19}
            propBorderRadius={dateinactivePropBorderRadius19}
            propBackgroundColor={dateinactivePropBackground19}
            prop={dateinactiveProp19}
            propColor={dateinactivePropColor19}
          />
        </div>
        <div className={styles.calendarWeek}>
          <Dateinactive
            propFlex={dateinactivePropFlex20}
            propWidth={dateinactivePropWidth20}
            propBorderRadius={dateinactivePropBorderRadius20}
            propBackgroundColor={dateinactivePropBackground20}
            prop={dateinactiveProp20}
            propColor={dateinactivePropColor20}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex21}
            propWidth={dateinactivePropWidth21}
            propBorderRadius={dateinactivePropBorderRadius21}
            propBackgroundColor={dateinactivePropBackground21}
            prop={dateinactiveProp21}
            propColor={dateinactivePropColor21}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex22}
            propWidth={dateinactivePropWidth22}
            propBorderRadius={dateinactivePropBorderRadius22}
            propBackgroundColor={dateinactivePropBackground22}
            prop={dateinactiveProp22}
            propColor={dateinactivePropColor22}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex23}
            propWidth={dateinactivePropWidth23}
            propBorderRadius={dateinactivePropBorderRadius23}
            propBackgroundColor={dateinactivePropBackground23}
            prop={dateinactiveProp23}
            propColor={dateinactivePropColor23}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex24}
            propWidth={dateinactivePropWidth24}
            propBorderRadius={dateinactivePropBorderRadius24}
            propBackgroundColor={dateinactivePropBackground24}
            prop={dateinactiveProp24}
            propColor={dateinactivePropColor24}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex25}
            propWidth={dateinactivePropWidth25}
            propBorderRadius={dateinactivePropBorderRadius25}
            propBackgroundColor={dateinactivePropBackground25}
            prop={dateinactiveProp25}
            propColor={dateinactivePropColor25}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex26}
            propWidth={dateinactivePropWidth26}
            propBorderRadius={dateinactivePropBorderRadius26}
            propBackgroundColor={dateinactivePropBackground26}
            prop={dateinactiveProp26}
            propColor={dateinactivePropColor26}
          />
        </div>
        <div className={styles.calendarWeek}>
          <Dateinactive
            propFlex={dateinactivePropFlex27}
            propWidth={dateinactivePropWidth27}
            propBorderRadius={dateinactivePropBorderRadius27}
            propBackgroundColor={dateinactivePropBackground27}
            prop={dateinactiveProp27}
            propColor={dateinactivePropColor27}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex28}
            propWidth={dateinactivePropWidth28}
            propBorderRadius={dateinactivePropBorderRadius28}
            propBackgroundColor={dateinactivePropBackground28}
            prop={dateinactiveProp28}
            propColor={dateinactivePropColor28}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex29}
            propWidth={dateinactivePropWidth29}
            propBorderRadius={dateinactivePropBorderRadius29}
            propBackgroundColor={dateinactivePropBackground29}
            prop={dateinactiveProp29}
            propColor={dateinactivePropColor29}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex30}
            propWidth={dateinactivePropWidth30}
            propBorderRadius={dateinactivePropBorderRadius30}
            propBackgroundColor={dateinactivePropBackground30}
            prop={dateinactiveProp30}
            propColor={dateinactivePropColor30}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex31}
            propWidth={dateinactivePropWidth31}
            propBorderRadius={dateinactivePropBorderRadius31}
            propBackgroundColor={dateinactivePropBackground31}
            prop={dateinactiveProp31}
            propColor={dateinactivePropColor31}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex32}
            propWidth={dateinactivePropWidth32}
            propBorderRadius={dateinactivePropBorderRadius32}
            propBackgroundColor={dateinactivePropBackground32}
            prop={dateinactiveProp32}
            propColor={dateinactivePropColor32}
          />
          <Dateinactive
            propFlex={dateinactivePropFlex33}
            propWidth={dateinactivePropWidth33}
            propBorderRadius={dateinactivePropBorderRadius33}
            propBackgroundColor={dateinactivePropBackground33}
            prop={dateinactiveProp33}
            propColor={dateinactivePropColor33}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
