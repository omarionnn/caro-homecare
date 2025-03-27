/**
 * Format a date to a user-friendly string (Month Day, Year)
 * @param date Date object or date string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date to a shorter format (MM/DD/YYYY)
 * @param date Date object or date string
 * @returns Formatted date string
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format time to 12-hour format (hh:mm AM/PM)
 * @param time Date object or date/time string
 * @returns Formatted time string
 */
export const formatTime = (time: Date | string): string => {
  if (!time) return '';
  
  const timeObj = typeof time === 'string' ? new Date(time) : time;
  return timeObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Calculate the duration between two dates in hours and minutes
 * @param startTime Start date/time string
 * @param endTime End date/time string 
 * @returns Duration string (e.g. "2 hrs 30 min")
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  if (isNaN(start) || isNaN(end)) {
    return 'Invalid time';
  }
  
  const durationMs = end - start;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min`;
  }
};

/**
 * Check if a date is today
 * @param date Date to check
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is tomorrow
 * @param date Date to check
 * @returns Boolean indicating if the date is tomorrow
 */
export const isTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Get a friendly relative date string (Today, Tomorrow, or formatted date)
 * @param date Date to format
 * @returns Friendly date string
 */
export const getRelativeDateString = (date: Date | string): string => {
  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else {
    return formatDate(date);
  }
};

/**
 * Format a date for API requests (YYYY-MM-DD)
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date and time for API requests (YYYY-MM-DDTHH:mm:ss)
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatApiDateTime = (date: Date): string => {
  const dateString = formatApiDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${dateString}T${hours}:${minutes}:${seconds}`;
};