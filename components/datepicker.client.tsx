import React, { useState, useEffect } from 'react';
import { formatDate, getMonthName, getWeekNumber } from './helpers/datetime.format';

interface CalendarProps {
    title: string;
    placeholder: string;
    value?: string;
    startAndEndDate?: boolean;
    setDates: (dates: { startDate?: Date; endDate?: Date }) => void;
}

const DatePicker: React.FC<CalendarProps> = ({ title, placeholder, value, setDates, startAndEndDate = true }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState({
        startDate: new Date(Date.now()),
        endDate: new Date(Date.now())
    });
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredDate, setHoveredDate] = useState(null);

    const toggleCalendar = () => setIsVisible(!isVisible);

    const nextMonth = () => {
        const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
        setCurrentMonth(nextMonthDate);
    };

    const prevMonth = () => {
        const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
        setCurrentMonth(prevMonthDate);
    };

    const goToCurrentMonth = () => {
        const date = new Date(Date.now());
        const nowMonth = new Date(date.getFullYear(), date.getMonth());
        setCurrentMonth(nowMonth);
    }

    const selectDate = (date) => {
        if (!startAndEndDate) {
            setSelectedDates({ startDate: date, endDate: null });
            setDates({ startDate: date });
            setIsVisible(false);
            return;
        }

        const { startDate, endDate } = selectedDates;
        if (!startDate || endDate) {
            setSelectedDates({ startDate: date, endDate: null });
            setHoveredDate(null);
        } else {
            const _startDate = startDate > date ? date : startDate;
            const _endDate = startDate > date ? startDate : date

            setSelectedDates(prev => ({
                startDate: prev.startDate > date ? date : prev.startDate,
                endDate: prev.startDate > date ? prev.startDate : date
            }));

            setDates({ startDate: _startDate, endDate: _endDate });

            setIsVisible(false);
        }
    };

    const daysInMonth = (date) => {
        const days = [];
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const startDay = firstDayOfMonth.getDay();
        const endDay = lastDayOfMonth.getDay();

        for (let i = startDay; i > 0; i--) {
            const day = new Date(firstDayOfMonth);
            day.setDate(day.getDate() - i);
            days.push(day);
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(date.getFullYear(), date.getMonth(), i));
        }

        for (let i = 1; i < 7 - endDay; i++) {
            const day = new Date(lastDayOfMonth);
            day.setDate(day.getDate() + i);
            days.push(day);
        }

        return days;
    };



    const isInRange = (date) => {
        if (!startAndEndDate) return;

        const { startDate, endDate } = selectedDates;
        if (hoveredDate && startDate && !endDate) {
            const start = startDate < hoveredDate ? startDate : hoveredDate;
            const end = startDate > hoveredDate ? startDate : hoveredDate;
            return date >= start && date <= end;
        }
        return startDate && endDate && date >= startDate && date <= endDate;
    };

    const handleMouseOver = (date) => {
        if (selectedDates.startDate && !selectedDates.endDate) {
            setHoveredDate(date);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('#date-picker-container')) {
                setIsVisible(false);
                setHoveredDate(null);
            }
        };

        window.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isStartOrEndDate = (day, start) => {
        let selectedStartDate = selectedDates.startDate;
        if (selectedDates.endDate != null) {
            selectedStartDate = start ? selectedDates.startDate : selectedDates.endDate;
        }

        const date =
            `${day.getFullYear()}-${day.getMonth().toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
        const startDate =
            `${selectedStartDate.getFullYear()}-${selectedStartDate.getMonth().toString().padStart(2, '0')}-${selectedStartDate.getDate().toString().padStart(2, '0')}`;

        return date === startDate;
    };

    return (
        <div className="relative mt-5 w-full">
            <input
                className="peer block w-full rounded-md border-0 py-2.5 pl-3 pr-2.5 text-gray-900 ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm bg-slate-200"
                type="text"
                placeholder={placeholder}
                value={value ? value : startAndEndDate ?
                    `${formatDate(selectedDates.startDate)} / ${formatDate(selectedDates.endDate)}` :
                    formatDate(selectedDates.startDate)}
                readOnly
                onClick={toggleCalendar}
            />

            <label
                className="absolute left-3 -top-2.5 text-gray-500 transition-all duration-200 ease-in-out  peer-focus:text-sm  peer-focus:text-indigo-600 bg-slate-200 px-2 text-sm font-medium"
            >
                {title}
            </label>

            {isVisible && (
                <div className="absolute top-full mt-1 bg-white border rounded shadow-lg z-20 p-5" id="date-picker-container">
                    <div className="flex justify-between items-center text-center font-semibold mb-2">
                        <button onClick={prevMonth}>
                            <svg className="w-4 h-4" viewBox="0 0 320 512">
                                <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                            </svg>
                        </button>
                        <span className="cursor-pointer select-none" onDoubleClick={goToCurrentMonth}>{getMonthName(currentMonth)} {currentMonth.getFullYear()}</span>
                        <button onClick={nextMonth}>
                            <svg className="w-4 h-4 rotate-180" viewBox="0 0 320 512">
                                <path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                            </svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-8 mt-5 gap-y-0 place-items-center w-[225px]">
                        {daysInMonth(currentMonth).map((day, index) => (
                            <React.Fragment key={index}>
                                {index % 7 === 0 &&
                                    <div className='text-[0.5rem] text-indigo-500 font-bold justify-self-start self-start'>
                                        {getWeekNumber(day)}
                                    </div>
                                }
                                <div className={`relative w-[27.5px] h-[27.5px] p-0.5`}>
                                    <div
                                        key={day}
                                        className={`peer select-none w-full h-full cursor-pointer flex items-center justify-center text-sm rounded hover:bg-indigo-600 hover:text-white${day.getMonth() === currentMonth.getMonth() ? '' : ' text-gray-400'}${isInRange(day) ? ' bg-blue-100' : ''}${(isStartOrEndDate(day, true) || isStartOrEndDate(day, false)) ? ' bg-indigo-600 text-white' : ''}${selectedDates.startDate && selectedDates.startDate === day.toDateString() ? ' bg-indigo-500  text-white' : ''}${(selectedDates.endDate && selectedDates.endDate === day.toDateString()) ? ' bg-indigo-500 text-white' : ''}${(index % 7 === 0 || index % 7 === 6) ? ' font-normal' : ''}${(day.getMonth() === new Date(Date.now()).getMonth()) && (day.getDate() === new Date(Date.now()).getDate()) ? ' font-bold' : ' font-light'}`}
                                        onClick={() => selectDate(day)}
                                        onMouseOver={() => handleMouseOver(day)}
                                    >
                                        {day.getDate()}
                                    </div>
                                    {(index % 7 > 0 && index % 7 < 6) && <span className='absolute w-1 h-1 rounded-full bg-indigo-600 top-[3px] right-[3px] peer-hover:bg-white' />}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DatePicker;