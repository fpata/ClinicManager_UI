import { Injectable } from '@angular/core';

/**
 * UtilityService
 * Generic date/time formatting helper.
 * Supported tokens:
 *  yyyy - 4 digit year
 *  MM   - month (01-12)
 *  dd   - day of month (01-31)
 *  HH   - hours 24h (00-23)
 *  hh   - hours 12h (01-12)
 *  h    - hours 12h (1-12)
 *  mm   - minutes (00-59)
 *  ss   - seconds (00-59)
 *  tt   - AM/PM
 */
@Injectable({ providedIn: 'root' })
export class UtilityService {
  public getDefaultStartDate(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  }

  public getDefaultEndDate(): Date {
    const start = this.getDefaultStartDate();
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  format(dateInput: Date | string | number, pattern: string = 'yyyy-MM-dd'): string {
    const date = this.coerce(dateInput);
    if (!date) return '';

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    // Replace longer tokens first to avoid partial collisions
    return pattern
      .replace(/yyyy/g, year.toString())
      .replace(/MM/g, this.pad(month))
      .replace(/dd/g, this.pad(day))
      .replace(/HH/g, this.pad(hour24))
      .replace(/hh/g, this.pad(hour12))
      .replace(/h/g, hour12.toString())
      .replace(/mm/g, this.pad(minutes))
      .replace(/ss/g, this.pad(seconds))
      .replace(/tt/g, ampm);
  }

  formatDate(dateInput: Date | string | number, dateformat?: string | null): string {
    if (dateformat === null || dateformat === undefined)
      dateformat = 'yyyy-MM-dd';
    return this.format(dateInput, dateformat);
  }

  formatDateTime(dateInput: Date | string | number, dateformat?: string | null): string {
    if (dateformat === null || dateformat === undefined)
      dateformat = 'yyyy-MM-ddTHH:mm:ss';
    return this.format(dateInput, dateformat);
  }

  private pad(n: number): string { return n.toString().padStart(2, '0'); }

  private coerce(value: Date | string | number): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  }

  /**
   * Converts a local Date (interpreted in the current timezone) to a UTC Date object
   * representing the same wall clock components. Useful only if you must persist wall time
   * but backend interprets as UTC. (Usually prefer storing real UTC instant instead.)
   */
  localWallTimeToUtc(dateInput: Date | string | number): Date | null {
    const d = this.coerce(dateInput);
    if (!d) return null;
    // Build a UTC date with same Y-M-D-H-M-S parts
    return new Date(Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ));
  }

  /**
   * Creates a local Date from a UTC date that was previously produced by localWallTimeToUtc.
   * (Inverse operation for display.)
   */
  utcWallTimeToLocal(dateInput: Date | string | number): Date | null {
    const d = this.coerce(dateInput);
    if (!d) return null;
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    );
  }

  /**
   * Returns a local wall time string (no timezone) suitable for storing without TZ shift.
   * Format: yyyy-MM-ddTHH:mm:ss
   */
  toLocalDateTimeString(dateInput: Date | string | number): string {
    return this.formatDateTime(dateInput, 'yyyy-MM-ddTHH:mm:ss');
  }

  validateEmail(email: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  validateMobile(mobile: string) {
    // Allows digits, spaces, +, and - characters
    const mobilePattern = /^[\d+\-\s]+$/;
    return mobilePattern.test(mobile.trim());
  }



  /**
   * Handles appointment date/time conversion with timezone consideration
   * @param date Base date
   * @param timeString Time in HH:mm format
   * @returns Date object with correct local time
   */
  createAppointmentDateTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const appointmentDate = new Date(date);

    // Create date using local timezone components
    // Note: new Date(year, month, day, hours, minutes) creates a local time Date object.
    // No timezone adjustment needed.
    return new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
      hours,
      minutes,
      0,
      0
    );
  }

  /**
     * Handles appointment date/time conversion with timezone consideration
     * @param date Base date
     * @param timeString Time in HH:mm format
     * @returns Date object with correct local time
     */
  createAppointmentDateTimeFromString(stringDate: string, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const appointmentDate = new Date(stringDate);

    // Create date using local timezone components
    // Note: new Date(year, month, day, hours, minutes) creates a local time Date object.
    // No timezone adjustment needed.
    return new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
      hours,
      minutes,
      0,
      0
    );
  }


  /**
   * Creates a default appointment time range
   * @returns Object containing start and end times
   */
  getDefaultAppointmentTimes(): { startTime: string, endTime: string } {
    const now = new Date();
    // Adjust for local timezone
    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const thirtyMinutesLater = new Date(localNow.getTime() + 30 * 60000);

    return {
      startTime: localNow.toLocaleTimeString('en-GB').slice(0, 5),
      endTime: thirtyMinutesLater.toLocaleTimeString('en-GB').slice(0, 5)
    };
  }

  /**
   * Formats date for display in local timezone
   * @param date Date to format
   * @returns Formatted date string
   */
  formatAppointmentDateTime(date: Date): string {
    // Create a new date object adjusted for local timezone
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  /**
   * Converts UTC date to local date
   * @param date UTC date
   * @returns Local date
   */
  toLocalTime(date: Date): Date {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  }

  /**
   * Converts local date to UTC date
   * @param date Local date
   * @returns UTC date
   */
  toUTCTime(date: Date): Date {
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  }

  /**
   * Rounds a date to the nearest 30-minute interval
   * @param date Date to round
   * @returns Date rounded to nearest 30-minute interval
   */
  roundToNearestInterval(date: Date, intervalMinutes: number = 30): Date {
    const roundedDate = new Date(date);
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes;
    roundedDate.setMinutes(roundedMinutes);
    roundedDate.setSeconds(0);
    roundedDate.setMilliseconds(0);
    return roundedDate;
  }

  getFileNameFromPath(filePath: string): string {
    return filePath.split('/').pop() || '';
  }
}