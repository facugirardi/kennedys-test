import type { NextPage } from "next";
import Calendar from "./calendar.old"
import styles from "./villa-details.module.css"

export type VillaDetailsType = {
  className?: string;
};

const VillaDetails: NextPage<VillaDetailsType> = ({ className = "" }) => {
  return (
    <section className={[styles.villaDetails, className].join(" ")}>
      <div className={styles.villaImage} />
      <div className={styles.villaDetailsContent} />
      <div className={styles.villaDetailsContent1} />
      <div className={styles.row}>
        <div className={styles.block}>
          <h3 className={styles.groundFloor}>GROUND FLOOR</h3>
          <div className={styles.openPlanLivingContainer}>
            <ul className={styles.openPlanLivingDiningArea}>
              <li
                className={styles.openPlanLiving}
              >{`Open plan Living & dining area with sea view and access to the pool area `}</li>
              <li className={styles.openPlanLiving}>Fully equipped kitchen</li>
              <li>3 Double bedrooms with en-suite bathrooms</li>
            </ul>
          </div>
        </div>
        <div className={styles.block1}>
          <div className={styles.stFloor}>
            <span>
              <span className={styles.span}>1</span>
              <span className={styles.stFloor1}>
                st
                <span className={styles.span}> FLOOR</span>
              </span>
            </span>
          </div>
          <div className={styles.openPlanLivingContainer}>
            <ul className={styles.openPlanLivingDiningArea}>
              <li>{`1 Master bedroom with en-suite bathroom, sea & sunset views, and access to a private balcony`}</li>
            </ul>
          </div>
        </div>
        <div className={styles.block}>
          <h3 className={styles.lowerFloor}>LOWER FLOOR</h3>
          <div className={styles.openPlanLivingContainer}>
            <ul className={styles.openPlanLivingDiningArea}>
              <li>
                2 Double bedrooms, sharing a bathroom and both have access to a
                garden area balcony
              </li>
            </ul>
          </div>
        </div>
      </div>
      <h2 className={styles.theVilla}>The Villa</h2>
      <h2 className={styles.availability}>Prices/Night</h2>
      <h2 className={styles.availability}>Availability</h2>
      <div className={styles.villaDetailsContent2}>
        <div className={styles.detailDivider} />
      </div>
      <div className={styles.villaDetailsContent3}>
        <div className={styles.detailDivider} />
      </div>
      <img
        className={styles.availabilityCalendarIcon}
        loading="lazy"
        alt=""
        src="/group-811@2x.png"
      />
      <Calendar
        monthSAT="SUN"
        monthSAT1="MON"
        monthSAT2="TUE"
        monthSAT3="WED"
        monthSAT4="THU"
        monthSAT5="FRI"
        monthSAT6="SAT"
        monthPropWidth="29px"
        monthPropWidth1="33px"
        monthPropWidth2="28px"
        monthPropWidth3="33px"
        monthPropWidth4="29px"
        monthPropWidth5="22px"
        dateinactiveProp="1"
        dateinactiveProp1="2"
        dateinactiveProp2="3"
        dateinactiveProp3="4"
        dateinactiveProp4="5"
        dateinactiveProp5="6"
        dateinactiveProp6="7"
        dateinactiveProp7="8"
        dateinactiveProp8="9"
        dateinactiveProp9="10"
        dateinactiveProp10="11"
        dateinactiveProp11="12"
        dateinactiveProp12="13"
        dateinactiveProp13="14"
        dateinactiveProp14="15"
        dateinactiveProp15="16"
        dateinactiveProp16="17"
        dateinactiveProp17="18"
        dateinactiveProp18="20"
        dateinactiveProp19="21"
        dateinactiveProp20="22"
        dateinactiveProp21="23"
        dateinactiveProp22="24"
        dateinactiveProp23="25"
        dateinactiveProp24="26"
        dateinactiveProp25="27"
        dateinactiveProp26="28"
        dateinactiveProp27="29"
        dateinactiveProp28="30"
        dateinactiveProp29="31"
        dateinactiveProp30="31"
        dateinactiveProp31="31"
        dateinactiveProp32="31"
        dateinactiveProp33="31"
        dateinactivePropFlex="1"
        dateinactivePropFlex1="1"
        dateinactivePropFlex2="1"
        dateinactivePropFlex3="1"
        dateinactivePropFlex4="1"
        dateinactivePropFlex5="1"
        dateinactivePropFlex6="1"
        dateinactivePropFlex7="1"
        dateinactivePropFlex8="1"
        dateinactivePropFlex9="1"
        dateinactivePropFlex10="1"
        dateinactivePropFlex11="1"
        dateinactivePropFlex12="1"
        dateinactivePropFlex13="1"
        dateinactivePropFlex14="1"
        dateinactivePropFlex15="1"
        dateinactivePropFlex16="1"
        dateinactivePropFlex17="1"
        dateinactivePropFlex18="1"
        dateinactivePropFlex19="1"
        dateinactivePropFlex20="1"
        dateinactivePropFlex21="1"
        dateinactivePropFlex22="1"
        dateinactivePropFlex23="1"
        dateinactivePropFlex24="1"
        dateinactivePropFlex25="1"
        dateinactivePropFlex26="1"
        dateinactivePropFlex27="1"
        dateinactivePropFlex28="1"
        dateinactivePropFlex29="1"
        dateinactivePropFlex30="1"
        dateinactivePropFlex31="1"
        dateinactivePropFlex32="1"
        dateinactivePropWidth="unset"
        dateinactivePropWidth1="unset"
        dateinactivePropWidth2="unset"
        dateinactivePropWidth3="unset"
        dateinactivePropWidth4="unset"
        dateinactivePropWidth5="unset"
        dateinactivePropWidth6="unset"
        dateinactivePropWidth7="unset"
        dateinactivePropWidth8="unset"
        dateinactivePropWidth9="unset"
        dateinactivePropWidth10="unset"
        dateinactivePropWidth11="unset"
        dateinactivePropWidth12="unset"
        dateinactivePropWidth13="unset"
        dateinactivePropWidth14="unset"
        dateinactivePropWidth15="unset"
        dateinactivePropWidth16="unset"
        dateinactivePropWidth17="unset"
        dateinactivePropWidth18="unset"
        dateinactivePropWidth19="unset"
        dateinactivePropWidth20="unset"
        dateinactivePropWidth21="unset"
        dateinactivePropWidth22="unset"
        dateinactivePropWidth23="unset"
        dateinactivePropWidth24="unset"
        dateinactivePropWidth25="unset"
        dateinactivePropWidth26="unset"
        dateinactivePropWidth27="unset"
        dateinactivePropWidth28="unset"
        dateinactivePropWidth29="unset"
        dateinactivePropWidth30="unset"
        dateinactivePropWidth31="unset"
        dateinactivePropWidth32="unset"
        dateinactivePropBorderRadius="unset"
        dateinactivePropBorderRadius1="unset"
        dateinactivePropBorderRadius2="unset"
        dateinactivePropBorderRadius3="unset"
        dateinactivePropBorderRadius4="unset"
        dateinactivePropBorderRadius5="unset"
        dateinactivePropBorderRadius6="unset"
        dateinactivePropBorderRadius7="unset"
        dateinactivePropBorderRadius8="unset"
        dateinactivePropBorderRadius9="unset"
        dateinactivePropBorderRadius10="unset"
        dateinactivePropBorderRadius11="unset"
        dateinactivePropBorderRadius12="unset"
        dateinactivePropBorderRadius13="unset"
        dateinactivePropBorderRadius14="unset"
        dateinactivePropBorderRadius15="unset"
        dateinactivePropBorderRadius16="unset"
        dateinactivePropBorderRadius17="unset"
        dateinactivePropBorderRadius18="unset"
        dateinactivePropBorderRadius19="unset"
        dateinactivePropBorderRadius20="unset"
        dateinactivePropBorderRadius21="unset"
        dateinactivePropBorderRadius22="unset"
        dateinactivePropBorderRadius23="unset"
        dateinactivePropBorderRadius24="unset"
        dateinactivePropBorderRadius25="unset"
        dateinactivePropBorderRadius26="unset"
        dateinactivePropBorderRadius27="unset"
        dateinactivePropBorderRadius28="unset"
        dateinactivePropBorderRadius29="unset"
        dateinactivePropBorderRadius30="unset"
        dateinactivePropBorderRadius31="unset"
        dateinactivePropBorderRadius32="unset"
        dateinactivePropBackground="unset"
        dateinactivePropBackground1="unset"
        dateinactivePropBackground2="unset"
        dateinactivePropBackground3="unset"
        dateinactivePropBackground4="unset"
        dateinactivePropBackground5="unset"
        dateinactivePropBackground6="unset"
        dateinactivePropBackground7="unset"
        dateinactivePropBackground8="unset"
        dateinactivePropBackground9="unset"
        dateinactivePropBackground10="unset"
        dateinactivePropBackground11="unset"
        dateinactivePropBackground12="unset"
        dateinactivePropBackground13="unset"
        dateinactivePropBackground14="unset"
        dateinactivePropBackground15="unset"
        dateinactivePropBackground16="unset"
        dateinactivePropBackground17="unset"
        dateinactivePropBackground18="unset"
        dateinactivePropBackground19="unset"
        dateinactivePropBackground20="unset"
        dateinactivePropBackground21="unset"
        dateinactivePropBackground22="unset"
        dateinactivePropBackground23="unset"
        dateinactivePropBackground24="unset"
        dateinactivePropBackground25="unset"
        dateinactivePropBackground26="unset"
        dateinactivePropBackground27="unset"
        dateinactivePropBackground28="unset"
        dateinactivePropBackground29="unset"
        dateinactivePropBackground30="unset"
        dateinactivePropBackground31="unset"
        dateinactivePropBackground32="unset"
        dateinactivePropColor="#4a5660"
        dateinactivePropColor1="#4a5660"
        dateinactivePropColor2="#4a5660"
        dateinactivePropColor3="#4a5660"
        dateinactivePropColor4="#4a5660"
        dateinactivePropColor5="#4a5660"
        dateinactivePropColor6="#4a5660"
        dateinactivePropColor7="#4a5660"
        dateinactivePropColor8="#4a5660"
        dateinactivePropColor9="#4a5660"
        dateinactivePropColor10="#4a5660"
        dateinactivePropColor11="#4a5660"
        dateinactivePropColor12="#4a5660"
        dateinactivePropColor13="#4a5660"
        dateinactivePropColor14="#4a5660"
        dateinactivePropColor15="#4a5660"
        dateinactivePropColor16="#4a5660"
        dateinactivePropColor17="#4a5660"
        dateinactivePropColor18="#4a5660"
        dateinactivePropColor19="#4a5660"
        dateinactivePropColor20="#4a5660"
        dateinactivePropColor21="#4a5660"
        dateinactivePropColor22="#4a5660"
        dateinactivePropColor23="#4a5660"
        dateinactivePropColor24="#4a5660"
        dateinactivePropColor25="#4a5660"
        dateinactivePropColor26="#4a5660"
        dateinactivePropColor27="#4a5660"
        dateinactivePropColor28="#4a5660"
        dateinactivePropColor29="#4a5660"
        dateinactivePropColor30="#4a5660"
        dateinactivePropColor31="rgba(74, 86, 96, 0)"
        dateinactivePropColor32="rgba(74, 86, 96, 0)"
      />
    </section>
  );
};

export default VillaDetails;
