import { useState } from 'react';
import styles from './villa-calendar.module.css'

interface VillaCalendarProps {
  className?: string;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const VillaCalendar: React.FC<VillaCalendarProps> = ({
  className = "",
  selectedDate,
  onDateSelect,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = Array.from({ length: daysInMonth(currentDate) }, (_, i) => i + 1);
  const startDay = startDayOfMonth(currentDate);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect?.(newDate);
  };

  return (
    <div className={[styles.calendar, className].join(" ")}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton}>&lt;</button>
        <h2 className={styles.monthYear}>{`${monthName} ${year}`}</h2>
        <button onClick={handleNextMonth} className={styles.navButton}>&gt;</button>
      </div>

      <div className={styles.weekdays}>
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      <div className={styles.days}>
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className={styles.blank}></div>
        ))}
        {days.map((day) => (
          <div
            key={`day-${day}`}
            className={[
              styles.day,
             
            ].join(" ")}
            onClick={() => handleDateClick(day)}
          >
            <span className={[styles.dayNumber, isSelected(day) ? styles.selected : "",].join(" ")}>
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VillaCalendar;
