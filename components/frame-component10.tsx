import type { NextPage } from "next";
import VuesaxlinearheartIcon1 from "./vuesaxlinearheart-icon1"
import Vuesaxlinearhierarchy from "./vuesaxlinearhierarchy"
import { useRouter } from "next/router";
import Vuesaxlinearcandle2Icon from "./vuesaxlinearcandle2-icon"
import BookingFormLabels from "./booking-form-labels"
import FrameComponent from "./frame-component"
import styles from "./frame-component10.module.css"
import { useCallback, useState } from "react";
import { Calendar, Filter, ChevronDown, Search } from 'lucide-react';


export type FrameComponent10Type = {
  className?: string;
  property?: any;
};

const FrameComponent10: NextPage<FrameComponent10Type> = ({
  className = "",
  property
}) => {
  const router = useRouter();

  const onButtonsContainerClick = useCallback(() => {
    router.push("/villas-list");
  }, [router]);


  const [formData, setFormData] = useState({
    location: 'Mykonos',
    villa: '',
    checkIn: '',
    checkOut: ''
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleFilterClick = () => {
    // Add your filter logic here
  };

  return (
    <section className={[styles.heroContentParent, className].join(" ")}>
      <div className={styles.heroContent}>
        <h1 className={styles.teresa}>{property?.title}</h1>
        <div className={styles.aLuxuryVillaContainer}>
          <p className={styles.aLuxuryVilla}>{property?.description?.shortDescription}</p>
        </div>
        <div className={styles.heroActions}>
          <div className={styles.vuesaxlinearheartParent}>
            <VuesaxlinearheartIcon1
              vuesaxlinearheart="/vuesaxlinearheart1.svg"
              propHeight="26px"
              propWidth="26px"
            />
            <div className={styles.save}>Save</div>
          </div>
          <div className={styles.vuesaxlinearhierarchy2Parent}>
            <Vuesaxlinearhierarchy vuesaxlinearhierarchy2="/vuesaxlinearhierarchy2.svg" />
            <div className={styles.share}>Share</div>
          </div>
        </div>
        <div className={styles.label}>Price upon request</div>
      </div>
      <form className={styles.availabilityContent}>
        <div className={styles.checkAvailabilityParent}>
          <h1 className={styles.checkAvailability}>Check Availability</h1>
          {/* <button
            type="button"
            className={styles.buttons}
            onClick={handleFilterClick}
          >
            <div className={styles.label1}>Filters</div>
            <Filter />
          </button> */}
        </div>

        <div className={styles.bookingFormFieldsWrapper}>
          <div className={styles.bookingFormFields}>
            {/* Location Field */}
            <div className={styles.bookingFormLabels}>
              <div className={styles.label2}>
                <div>Location</div>
              </div>
              <div className={styles.fieldText}>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.container}
                >
                  <option value="Mykonos">Mykonos</option>
                  <option value="Santorini">Santorini</option>
                  <option value="Crete">Crete</option>
                </select>
                <ChevronDown className={styles.leadingIcon} />
              </div>
            </div>

            {/* Villa Field */}
            <div className={styles.bookingFormLabels}>
              <div className={styles.label2}>
                <div className={styles.villa}>Villa</div>
              </div>
              <div className={styles.fieldText}>
                <input
                  type="text"
                  name="villa"
                  value={formData.villa}
                  onChange={handleChange}
                  placeholder="Teresa"
                  className={styles.container}
                />
              </div>
            </div>

            {/* Date Fields */}
            <div className={styles.bookingFormLabels1}>
              <div className={styles.bookingFormLabels}>
                <div className={styles.label2}>
                  <div>Check In</div>
                </div>
                <div className={styles.fieldText}>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className={styles.container}
                  />
                  <Calendar className={styles.leadingIcon} />
                </div>
              </div>

              <div className={styles.bookingFormLabels}>
                <div className={styles.label2}>
                  <div>Check Out</div>
                </div>
                <div className={styles.fieldText}>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    className={styles.container}
                  />
                  <Calendar className={styles.leadingIcon} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className={styles.buttons1}>
          <div className={styles.label3}>Check Now</div>
          <Search className={styles.searchIcon} />
        </button>
      </form>
    </section>
  );
};

export default FrameComponent10;



