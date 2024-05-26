export const formatDate = (date: Date): string => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export const getFullDay = (date: Date): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

export const roundToNearestQuarterAndFormat = (date: Date): string => {
    let minutes = date.getMinutes();
    let roundedMinutes = Math.round(minutes / 15) * 15;
    if (roundedMinutes === 60) {
        date.setHours(date.getHours() + 1);
        roundedMinutes = 0;
    }
    date.setMinutes(roundedMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    const hours = date.getHours().toString().padStart(2, '0');
    const formattedMinutes = roundedMinutes.toString().padStart(2, '0');
    return `${hours}:${formattedMinutes}`;
}

export const getMonthName = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long' });
}

export const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (+date - +firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const normalizeDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const normalized = `${year}-${month}-${day}`;

    return normalized;
}