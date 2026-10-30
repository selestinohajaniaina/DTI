import { formatDate, formatPrice } from './format';

describe('formatDate', () => {
  it('formats ISO dates in US style', () => {
    expect(formatDate('2026-03-04T00:00:00.000Z')).toBe('Mar 4, 2026');
  });

  it('renders invalid input as Unknown date', () => {
    expect(formatDate('garbage')).toBe('Unknown date');
  });
});

describe('formatPrice', () => {
  it('formats dollar amounts with cents', () => {
    expect(formatPrice(2.5)).toBe('$2.50');
    expect(formatPrice(8)).toBe('$8.00');
    expect(formatPrice(3000)).toBe('$3,000.00');
  });

  it('renders missing or invalid values as Not available', () => {
    expect(formatPrice(null)).toBe('Not available');
    expect(formatPrice(undefined)).toBe('Not available');
    expect(formatPrice(Number.NaN)).toBe('Not available');
  });
});
