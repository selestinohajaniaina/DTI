/** Formats crafting minutes as "45 min" or "1 h 30 min". */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Display symbols keyed by the `marketPrice.currency` field (never hard-coded per call site). */
const CURRENCY_SYMBOLS: Record<string, string> = {
  MGA: 'Ar',
  USD: '$',
};

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
 * Formats an estimated price from its `marketPrice` fields, e.g. "Ar 3,000".
 * Missing or invalid values render as "Not available" instead of crashing.
 */
export function formatPrice(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Not available';
  }
  const grouped = new Intl.NumberFormat('en-US').format(Math.round(value));
  if (currency === 'USD') {
    return `$${grouped}`;
  }
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol} ${grouped}`;
}
