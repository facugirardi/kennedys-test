import type { NextPage } from "next";
import VillaItem from "./villa-item"
import styles from "./property-cards.module.css"

export type PropertyCardsType = {
  className?: string;
};

const PropertyCards: NextPage<PropertyCardsType> = ({ className = "" }) => {
  return (
    <section className={[styles.propertyCards, className].join(" ")}>
      <h1 className={styles.featuredProperties}>Featured Properties</h1>
      <div className={styles.vuesaxlineararchiveTick}>
        <img
          className={styles.vuesaxlineararchiveTickIcon}
          alt=""
          src="/vuesaxlineararchivetick.svg"
        />
      </div>
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/card-image@2x.png"
        propLeft="330px"
        title="Mia"
        title1="Ibiza"
        capa1="/capa-1-4@2x.png"
        title2=" € 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="89px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/rectangle-39-11@2x.png"
        propLeft="330px"
        title="Narcisa"
        title1="Ibiza"
        capa1="/capa-1-4@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/rectangle-39-2@2x.png"
        propLeft="330px"
        title="Antonella"
        title1="Ibiza"
        capa1="/capa-1-4@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/image-61@2x.png"
        propLeft="330px"
        title="Carmen"
        title1="Ibiza"
        capa1="/capa-1-7@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/image-71@2x.png"
        propLeft="330px"
        title="Sara"
        title1="Ibiza"
        capa1="/capa-1-7@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/image-81@2x.png"
        propLeft="330px"
        title="Camila"
        title1="Ibiza"
        capa1="/capa-1-7@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/rectangle-39-3@2x.png"
        propLeft="330px"
        title="Casa Gody"
        title1="Ibiza"
        capa1="/capa-1-10@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/rectangle-39-4@2x.png"
        propLeft="330px"
        title="Narcisa"
        title1="Ibiza"
        capa1="/capa-1-10@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
      <VillaItem
        propBorder="1px solid #a3a3a3"
        propFlex="unset"
        propMinWidth="unset"
        villaImage="/image-91@2x.png"
        propLeft="330px"
        title="Valeria"
        title1="Ibiza"
        capa1="/capa-1-10@2x.png"
        title2="€ 12,000.00"
        propDisplay="inline-block"
        propMinWidth1="86px"
      />
    </section>
  );
};

export default PropertyCards;
