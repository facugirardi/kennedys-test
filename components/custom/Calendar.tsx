import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { TbChevronLeft, TbChevronRight } from 'react-icons/tb';

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const generateCalendar = () => {
    const startDay = currentMonth.startOf('month').startOf('week');
    const endDay = currentMonth.endOf('month').endOf('week');
    let day = startDay.clone(); // ✅ usamos let
  
    const calendarDays = [];
    while (day.isBefore(endDay, 'day') || day.isSame(endDay, 'day')) {
      calendarDays.push(day.clone());
      day = day.add(1, 'day');
    }
  
    return calendarDays;
  };
  const days = useMemo(() => generateCalendar(), [currentMonth]);

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) =>
      direction === 'next' ? prev.add(1, 'month') : prev.subtract(1, 'month')
    );
  };

  return (
    <div className="mt-10   p-4 rounded-lg">
      <div className="flex justify-between  items-center mb-10">
        <button onClick={() => changeMonth('prev')}><TbChevronLeft size={27} className='text-gray-300' /></button>
        <h2 className="text-base font-semibold">{currentMonth.format('MMMM YYYY')}</h2>
        <button onClick={() => changeMonth('next')}><TbChevronRight size={27} className='text-gray-300' /></button>
      </div>
      <div className="grid grid-cols-7 text-center font-semibold gap-10 text-gray-300 mb-2">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-10 text-center gap-y-2">
        {days.map((day, idx) => {
          const isCurrentMonth = day.month() === currentMonth.month();
          const isSelected = selectedDate?.isSame(day, 'day');

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(prev => prev?.isSame(day, 'day') ? null : day)}
              className={`w-10 h-10 flex items-center justify-center mx-auto cursor-pointer
                ${!isCurrentMonth && 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all
                ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}>
                <span className='font-bold'>{day.date()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;