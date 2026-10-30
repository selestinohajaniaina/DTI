/** Formats crafting minutes as "45 min" or "1 h 30 min". */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Central USD formatter for every estimated price (never hard-coded per call site). */
const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/**
 * Formats an ISO date as "Oct 29, 2026" in UTC so the displayed day never
 * depends on the viewer's timezone. Invalid input renders as "Unknown
 * date" instead of crashing.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Formats an estimated USD price, e.g. "$8.00". Missing or invalid values
 * render as "Not available" instead of crashing.
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Not available';
  }
  return usdFormatter.format(value);
}
