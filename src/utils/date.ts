import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekday from 'dayjs/plugin/weekday';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(customParseFormat);

export const parseDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  
  // Excel serial number
  if (typeof value === 'number') {
    // Excel's epoch is 1900-01-01, but it incorrectly treats 1900 as a leap year
    // Serial number 1 = 1900-01-01
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return date;
  }
  
  // String date
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    
    // Try various formats
    const formats = [
      'YYYY/M/D',
      'YYYY/MM/DD',
      'YYYY-MM-DD',
      'M/D/YYYY',
      'MM/DD/YYYY',
      'D/M/YYYY',
      'DD/MM/YYYY'
    ];
    
    for (const format of formats) {
      const parsed = dayjs(trimmed, format, true);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    
    // Try native Date parsing as fallback
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Date object
  if (value instanceof Date) {
    return value;
  }
  
  return undefined;
};

export const formatDate = (date: Date | undefined, format = 'YYYY/M/D'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const addDays = (date: Date, days: number): Date => {
  return dayjs(date).add(days, 'day').toDate();
};

export const diffDays = (start: Date, end: Date): number => {
  return dayjs(end).diff(dayjs(start), 'day');
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isHoliday = (date: Date, holidays: Date[]): boolean => {
  const dateStr = formatDate(date, 'YYYY-MM-DD');
  return holidays.some(h => formatDate(h, 'YYYY-MM-DD') === dateStr);
};

export const getDateRange = (tasks: { start?: Date; finish?: Date }[]): { min: Date; max: Date } | null => {
  const dates: Date[] = [];
  
  for (const task of tasks) {
    if (task.start) dates.push(task.start);
    if (task.finish) dates.push(task.finish);
  }
  
  if (dates.length === 0) return null;
  
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return { min, max };
};

export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
