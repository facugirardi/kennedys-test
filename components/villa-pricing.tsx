import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./villa-pricing.module.css"
import VillaCalendar from "./villa-calendar"
import { groupAvailabilityRangesByPriceAndMinStay, getPropertyPriceCurrencySymbol, propertyLocationUsesUsdDisplay } from '@/lib/utils'

export type VillaPricingType = {
  className?: string;
  propertyData?: any;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
};

const formatDateRange = (from: string, to: string) => {
  const fromDate = formatDate(from);
  const toDate = formatDate(to);
  return `${fromDate} - ${toDate}`;
};

const VillaPricing: NextPage<VillaPricingType> = ({ className = "", propertyData = {} }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const router = useRouter();
  const priceTableSuffix = propertyLocationUsesUsdDisplay(propertyData) ? '$' : '€';
  const priceTableCurrencySymbol = getPropertyPriceCurrencySymbol(propertyData);

  useEffect(() => {
    const { specialoffer } = router.query;
    if (specialoffer && typeof specialoffer === 'string') {
      const discount = parseInt(specialoffer);
      if (!isNaN(discount) && discount > 0 && discount <= 100) {
        setDiscountPercentage(discount);
      }
    }
  }, [router.query]);

  const calculateDiscountedPrice = (price: number): string => {
    if (discountPercentage > 0) {
      const discountedPrice = price * (1 - discountPercentage / 100);
      return discountedPrice.toLocaleString();
    }
    return price.toLocaleString();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Here you can add any additional logic when a date is selected
  };

  return (
    <section className={[styles.villaPricing, className].join(" ")}>
      <div className={styles.priceBackground} />
      <div className={styles.priceAvailabilityContainer}>
        <div className={styles.priceAvailability} />
        <div className={styles.priceAvailability1} />

        <div className={styles.row}>
          <p>{propertyData?.description?.accomodationDetails}</p>
        </div>

        <div className={styles.leftSection}>
          <h2 className={styles.theVilla}>The Villa</h2>
          {
            propertyData?.description?.theVilla?.groups?.map((group: any, index: number) => (
              <div key={group.id || index}>
                <h3 className={styles.floorTitle}>{group.title}</h3>
                <ul className={styles.floorList}>
                  {group.items?.map((item: any, itemIndex: number) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>

        <div className={styles.rightSection}>
          <div className={styles.headerRow}>
            <h2 className={[
              styles.availability,
              showCalendar ? styles.inactive : ''
            ].join(" ")}>
              Prices/Night
            </h2>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className={styles.availabilityButton}
            >
              <h2 className={[
                styles.availability,
                showCalendar ? styles.active : styles.inactive
              ].join(" ")}>
                Availability
              </h2>
            </button>
          </div>
          <div className={styles.headerSeparator} />
          
          {showCalendar ? (
            <div className={styles.calendarContainer}>
              <VillaCalendar 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          ) : (
            <div className={styles.priceTableContainer}>
              <table className={styles.priceTable}>
                <thead>
                  <tr>
                    <th>DATES</th>
                    <th>MIN.STAY</th>
                    <th>PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyData?.availabilityRanges && propertyData.availabilityRanges.length > 0
                    ? groupAvailabilityRangesByPriceAndMinStay(propertyData.availabilityRanges, priceTableCurrencySymbol).map((range: any, index: number) => (
                        <tr key={index}>
                          <td>{range.dateRangeFormatted}</td>
                          <td>{range.minStay}</td>
                          <td>
                            {discountPercentage > 0 && (
                              <span className={styles.originalPrice}>
                                {range.priceNumeric.toLocaleString()}{priceTableSuffix}
                              </span>
                            )}
                            {calculateDiscountedPrice(range.priceNumeric)}{priceTableSuffix}
                            {discountPercentage > 0 && (
                              <span className={styles.discountBadge}>
                                -{discountPercentage}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VillaPricing;
