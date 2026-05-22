import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateWithTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const prefix = isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d');
    return `${prefix}, ${format(date, 'h:mm a')}`;
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMMM yyyy');
  } catch {
    return dateStr;
  }
}

export function todayIsoDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
