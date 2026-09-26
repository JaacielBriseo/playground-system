import { addDays, format, parseISO } from 'date-fns';

/**
 * The application's display timezone, sourced from the backend
 * (`config('app.display_timezone')`) and hydrated once at app startup via
 * {@link setAppTimezone}. Falls back to the same default as the backend.
 */
let appTimezone = 'America/Hermosillo';

/** Set the display timezone (call once at startup with the Inertia-shared value). */
export const setAppTimezone = (tz: string | undefined | null): void => {
    if (tz) appTimezone = tz;
};

/** The current display timezone. */
export const getAppTimezone = (): string => appTimezone;

export const DateFormats = {
    'YYYY-MM-DD': 'yyyy-MM-dd',
    'MM/DD/YYYY': 'MM/dd/yyyy',
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'MMMM D, YYYY': 'MMMM d, yyyy',
    'D MMMM YYYY': 'd MMMM yyyy',
    'DD/MM/YYYY HH:mm': 'dd/MM/yyyy HH:mm',
} as const;

/** A calendar-date string `YYYY-MM-DD`, optionally with a midnight-UTC time from a Laravel `date` cast. */
const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}(T00:00:00(\.0+)?Z?)?$/;

/**
 * Format a value for display.
 *
 * Calendar dates (`visit_date`, `scheduled_date`, …) are read as a plain day —
 * never shifted across timezones. Full instants are parsed as UTC and rendered
 * in the browser's local timezone (use {@link formatDateTime} to pin to the app
 * timezone instead).
 */
export const formatDate = (date: Date | string, dateFormat: keyof typeof DateFormats = 'DD/MM/YYYY'): string => {
    let parsedDate: Date;
    if (typeof date === 'string') {
        // Slice to the date portion so a calendar date is parsed as local midnight, not UTC.
        parsedDate = CALENDAR_DATE_RE.test(date) ? parseISO(date.slice(0, 10)) : parseISO(date);
    } else {
        parsedDate = date;
    }

    const formatType = DateFormats[dateFormat] || DateFormats['DD/MM/YYYY'];

    return format(parsedDate, formatType);
};

/** Date-only display options matching the app's `dd/MM/yyyy` style. */
export const DATE_ONLY_OPTS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };

/** Date + 24h time display options. */
export const DATE_TIME_OPTS: Intl.DateTimeFormatOptions = {
    ...DATE_ONLY_OPTS,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
};

/**
 * Format a UTC instant (`created_at`, `paid_at`, `started_at`, …) in the fixed
 * app timezone. Defaults to date-only; pass {@link DATE_TIME_OPTS} (or custom
 * Intl options) to include time or a different style.
 */
export const formatDateTime = (date: Date | string, options: Intl.DateTimeFormatOptions = DATE_ONLY_OPTS): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return new Intl.DateTimeFormat('es-MX', { timeZone: appTimezone, ...options }).format(parsedDate);
};

/** Today as a `yyyy-MM-dd` string in the user's local timezone (not UTC). */
export const todayLocalISO = (): string => format(new Date(), 'yyyy-MM-dd');

/** Parse a calendar-date string as local midnight (avoids UTC off-by-one). */
export const parseLocalDate = (iso: string): Date => parseISO(iso.slice(0, 10));

/** Format a Date as a `yyyy-MM-dd` string using local time. */
export const toLocalISO = (date: Date): string => format(date, 'yyyy-MM-dd');

/** Add `n` days to a `yyyy-MM-dd` string, returning a `yyyy-MM-dd` string. */
export const addDaysISO = (iso: string, n: number): string => toLocalISO(addDays(parseLocalDate(iso), n));
