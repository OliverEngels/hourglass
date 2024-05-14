export const parseTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export const getTimeDifference = (startTime: string, endTime: string): number => {
    return parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
}

export const formatMinutesToHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
}

export const calculateTotalTime = (timeRanges: any): string => {
    let totalMinutes = 0;

    for (const range of timeRanges) {
        totalMinutes += getTimeDifference(range.starttime, range.endtime);
    }

    return formatMinutesToHours(totalMinutes);
}